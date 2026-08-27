const { pool, withTransaction } = require('../config/db');
const { generateSalarySlipPdf } = require('../services/pdfService');
const { logAudit } = require('../middleware/auditLogger');
const fs = require('fs');

const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// 1. Payroll Runs List
async function getPayrollRuns(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT pr.*, u.full_name as processor_name 
       FROM payroll_runs pr
       LEFT JOIN users u ON pr.processed_by = u.id
       ORDER BY pr.year DESC, pr.month DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch payroll runs' });
  }
}

// 2. Generate Monthly Payroll Run
async function generatePayrollRun(req, res) {
  try {
    const { month, year, notes } = req.body;
    const m = parseInt(month || (new Date().getMonth() + 1), 10);
    const y = parseInt(year || new Date().getFullYear(), 10);
    const runCode = `PAY-${y}-${String(m).padStart(2, '0')}`;

    const result = await withTransaction(async (conn) => {
      // Check if run already exists
      const [existing] = await conn.query(`SELECT id FROM payroll_runs WHERE month = ? AND year = ?`, [m, y]);
      if (existing.length > 0) {
        throw new Error(`Payroll run for ${monthNames[m]} ${y} has already been processed.`);
      }

      // Fetch all active employees
      const [employees] = await conn.query(`SELECT * FROM employees WHERE status = 'active'`);
      if (employees.length === 0) {
        throw new Error('No active employees found to process payroll.');
      }

      // Fetch all casual laborers
      const [casualWorkers] = await conn.query(
        `SELECT * FROM casual_labor WHERE MONTH(work_date_from) = ? AND YEAR(work_date_from) = ?`,
        [m, y]
      );

      let totalBasic = 0;
      let totalAllowances = 0;
      let totalDeductions = 0;
      let totalNetPayroll = 0;

      // Create Payroll Run Header
      const [runRes] = await conn.query(
        `INSERT INTO payroll_runs (run_code, month, year, total_employees, total_casual_workers, status, processed_by, processed_at, notes)
         VALUES (?, ?, ?, ?, ?, 'processed', ?, NOW(), ?)`,
        [runCode, m, y, employees.length, casualWorkers.length, req.user ? req.user.id : null, notes || `Consolidated monthly payroll for ${monthNames[m]} ${y}`]
      );
      const payrollRunId = runRes.insertId;

      // Generate Salary Slips for each employee
      for (const emp of employees) {
        const basic = parseFloat(emp.basic_salary) || 0;
        const housing = basic > 30000 ? 3000 : 1500;
        const monasticStipend = emp.employment_type === 'Monastic Sangha' ? 2500 : 0;
        const medical = 1000;
        const totalEarnings = basic + housing + monasticStipend + medical;

        const pf = basic * 0.05; // 5% PF
        const tax = basic > 30000 ? basic * 0.03 : 0; // 3% Tax
        const otherDeduct = 0;
        const totalDeduct = pf + tax + otherDeduct;
        const netSalary = totalEarnings - totalDeduct;

        totalBasic += basic;
        totalAllowances += (housing + monasticStipend + medical);
        totalDeductions += totalDeduct;
        totalNetPayroll += netSalary;

        const slipNo = `SLIP-${y}-${String(m).padStart(2, '0')}-${emp.employee_code}`;

        await conn.query(
          `INSERT INTO salary_slips (payroll_run_id, employee_id, slip_no, month, year, basic_salary, housing_allowance, monastic_stipend, medical_allowance, total_earnings, pf_deduction, tax_deduction, other_deductions, total_deductions, net_salary, payment_status, payment_date, payment_method)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', CURDATE(), 'Bank Transfer')`,
          [payrollRunId, emp.id, slipNo, m, y, basic, housing, monasticStipend, medical, totalEarnings, pf, tax, otherDeduct, totalDeduct, netSalary]
        );
      }

      // Compute Casual Labor Costs
      let totalCasualLaborCost = 0;
      for (const cw of casualWorkers) {
        totalCasualLaborCost += parseFloat(cw.total_amount) || 0;
        await conn.query(`UPDATE casual_labor SET payroll_run_id = ?, payment_status = 'paid' WHERE id = ?`, [payrollRunId, cw.id]);
      }

      const grandTotal = totalNetPayroll + totalCasualLaborCost;

      // Update Run totals
      await conn.query(
        `UPDATE payroll_runs
         SET total_basic = ?,
             total_allowances = ?,
             total_deductions = ?,
             total_net_payroll = ?,
             total_casual_labor_cost = ?,
             grand_total = ?
         WHERE id = ?`,
        [totalBasic, totalAllowances, totalDeductions, totalNetPayroll, totalCasualLaborCost, grandTotal, payrollRunId]
      );

      return { payrollRunId, runCode, grandTotal, employeeCount: employees.length };
    });

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'payroll',
      action: 'generate',
      recordId: result.payrollRunId,
      details: { runCode: result.runCode, grandTotal: result.grandTotal }
    });

    return res.status(201).json({
      success: true,
      message: `Payroll run ${result.runCode} generated successfully. Total disbursed: INR ₹ ${result.grandTotal.toLocaleString()}`,
      data: result
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 3. Salary Slip Details & PDF Download
async function getSalarySlipsByRun(req, res) {
  try {
    const { id } = req.params;
    const [slips] = await pool.query(
      `SELECT ss.*, e.full_name as employee_name, e.employee_code, e.designation, e.department, e.bank_account_no, e.bank_name
       FROM salary_slips ss
       JOIN employees e ON ss.employee_id = e.id
       WHERE ss.payroll_run_id = ?
       ORDER BY e.id ASC`,
      [id]
    );
    return res.json({ success: true, data: slips });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch salary slips' });
  }
}

async function downloadSalarySlipPdf(req, res) {
  try {
    const { id } = req.params;
    const [slips] = await pool.query(
      `SELECT ss.*, e.full_name as employee_name, e.employee_code, e.designation, e.department, e.bank_account_no, e.bank_name
       FROM salary_slips ss
       JOIN employees e ON ss.employee_id = e.id
       WHERE ss.id = ?`,
      [id]
    );

    if (slips.length === 0) return res.status(404).json({ success: false, message: 'Salary slip not found' });

    const slip = slips[0];
    slip.month_name = monthNames[slip.month];

    const pdfResult = await generateSalarySlipPdf(slip);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="SalarySlip-${slip.slip_no}.pdf"`);

    const fileStream = fs.createReadStream(pdfResult.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('[Payslip PDF Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate payslip PDF' });
  }
}

// 4. Casual Labor CRUD
async function getCasualLabor(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT cl.*, e.full_name as supervisor_name
       FROM casual_labor cl
       LEFT JOIN employees e ON cl.supervisor_id = e.id
       ORDER BY cl.work_date_from DESC, cl.id DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch casual labor' });
  }
}

async function createCasualLabor(req, res) {
  try {
    const { workerName, workType, daysWorked, dailyRate, workDateFrom, workDateTo, supervisorId, notes } = req.body;
    const days = parseFloat(daysWorked || 1);
    const rate = parseFloat(dailyRate || 0);
    const totalAmount = days * rate;

    const [result] = await pool.query(
      `INSERT INTO casual_labor (worker_name, work_type, days_worked, daily_rate, total_amount, work_date_from, work_date_to, payment_status, supervisor_id, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [workerName, workType, days, rate, totalAmount, workDateFrom || CURDATE(), workDateTo || CURDATE(), supervisorId || null, notes || null]
    );

    return res.status(201).json({ success: true, message: 'Casual labor entry recorded', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to record casual labor' });
  }
}

module.exports = {
  getPayrollRuns,
  generatePayrollRun,
  getSalarySlipsByRun,
  downloadSalarySlipPdf,
  getCasualLabor,
  createCasualLabor
};
