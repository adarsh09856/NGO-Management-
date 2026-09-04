const { pool } = require('../config/db');

// Reports Hub Analytics & CSV Export
async function getReports(req, res) {
  try {
    const targetModule = req.params.module || req.query.module || 'donations';
    const format = req.query.format || (req.path.includes('/export') ? 'csv' : 'json');

    if (targetModule === 'donations') {
      const [rows] = await pool.query(
        `SELECT d.receipt_number, COALESCE(dn.full_name, 'Anonymous Devotee') as donor_name, dn.email, d.donation_for, d.amount, d.currency, d.payment_method, d.payment_date, d.payment_status
         FROM donations d
         LEFT JOIN donors dn ON d.donor_id = dn.id
         WHERE d.is_deleted = 0
         ORDER BY d.payment_date DESC`
      );

      if (format === 'csv') {
        const header = 'Receipt No,Donor Name,Email,Purpose,Amount,Currency,Payment Method,Date,Status\n';
        const csvRows = rows.map(r => `"${r.receipt_number}","${r.donor_name}","${r.email || ''}","${r.donation_for}",${r.amount},"${r.currency}","${r.payment_method}","${r.payment_date}","${r.payment_status}"`).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="donations_report.csv"');
        return res.send(header + csvRows);
      }

      return res.json({ success: true, data: rows });
    }

    if (targetModule === 'accounts') {
      const [rows] = await pool.query(
        `SELECT v.voucher_no, v.voucher_date, v.voucher_type, v.particulars, v.total_amount, v.payment_mode, v.status, ba.account_name
         FROM vouchers v
         LEFT JOIN bank_accounts ba ON v.bank_account_id = ba.id
         ORDER BY v.voucher_date DESC, v.id DESC`
      );

      if (format === 'csv') {
        const header = 'Voucher No,Date,Type,Particulars,Amount,Payment Mode,Status,Bank Account\n';
        const csvRows = rows.map(r => `"${r.voucher_no}","${r.voucher_date}","${r.voucher_type}","${r.particulars}",${r.total_amount},"${r.payment_mode || ''}","${r.status}","${r.account_name || ''}"`).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="accounts_ledger_report.csv"');
        return res.send(header + csvRows);
      }

      const [incomeRows] = await pool.query(`SELECT source_category, SUM(amount) as total FROM income GROUP BY source_category`);
      const [expenseRows] = await pool.query(`SELECT ec.name as category, SUM(e.amount) as total FROM expenses e JOIN expense_categories ec ON e.category_id = ec.id GROUP BY ec.id`);
      return res.json({ success: true, data: { vouchers: rows, incomeBySource: incomeRows, expensesByCategory: expenseRows } });
    }

    if (targetModule === 'inventory') {
      const [rows] = await pool.query(
        `SELECT si.item_code, si.item_name, c.name as category, si.current_stock, si.min_stock, si.unit_cost, (si.current_stock * si.unit_cost) as total_value, si.status
         FROM store_items si
         JOIN categories c ON si.category_id = c.id
         ORDER BY si.id ASC`
      );

      if (format === 'csv') {
        const header = 'Item Code,Item Name,Category,Current Stock,Min Stock,Unit Cost,Total Value,Status\n';
        const csvRows = rows.map(r => `"${r.item_code}","${r.item_name}","${r.category}",${r.current_stock},${r.min_stock},${r.unit_cost},${r.total_value},"${r.status}"`).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="inventory_report.csv"');
        return res.send(header + csvRows);
      }

      return res.json({ success: true, data: rows });
    }

    if (targetModule === 'students' || targetModule === 'monks') {
      const [rows] = await pool.query(
        `SELECT sm.roll_number, sm.monastic_name, sm.secular_name, sm.monk_status, sm.dzongkhag, sm.guardian_name, sm.guardian_phone, sm.status
         FROM students_monks sm
         ORDER BY sm.id ASC`
      );

      if (format === 'csv') {
        const header = 'Roll No,Monastic Name,Secular Name,Status,Dzongkhag,Guardian Name,Guardian Phone,Status\n';
        const csvRows = rows.map(r => `"${r.roll_number}","${r.monastic_name}","${r.secular_name || ''}","${r.monk_status}","${r.dzongkhag || ''}","${r.guardian_name || ''}","${r.guardian_phone || ''}","${r.status}"`).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="shedra_students_report.csv"');
        return res.send(header + csvRows);
      }

      return res.json({ success: true, data: rows });
    }

    if (targetModule === 'payroll' || targetModule === 'hrm') {
      const [rows] = await pool.query(
        `SELECT e.employee_code, e.full_name, e.department, e.designation, e.basic_salary, e.status
         FROM employees e
         ORDER BY e.id ASC`
      );

      if (format === 'csv') {
        const header = 'Employee Code,Full Name,Department,Designation,Basic Salary,Status\n';
        const csvRows = rows.map(r => `"${r.employee_code}","${r.full_name}","${r.department}","${r.designation}",${r.basic_salary},"${r.status}"`).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="payroll_report.csv"');
        return res.send(header + csvRows);
      }

      return res.json({ success: true, data: rows });
    }

    return res.status(400).json({ success: false, message: 'Invalid report module' });
  } catch (error) {
    console.error('[Report Controller Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
}

// Live Computed Real-Time Metrics for Admin Dashboard
async function getAdminDashboardMetrics(req, res) {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // 1. Total Donations (This Month & Total)
    const [monthDonationRow] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count 
       FROM donations 
       WHERE MONTH(payment_date) = ? AND YEAR(payment_date) = ? AND payment_status = 'completed' AND is_deleted = 0`,
      [currentMonth, currentYear]
    );

    const [allDonationRow] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count 
       FROM donations 
       WHERE payment_status = 'completed' AND is_deleted = 0`
    );

    // 2. Total Donors Count
    const [donorRow] = await pool.query(`SELECT COUNT(*) as count FROM donors`);

    // 3. Students / Monks Count
    const [monkRow] = await pool.query(`SELECT COUNT(*) as count FROM students_monks WHERE status = 'enrolled'`);

    // 4. Receipts This Month
    const [receiptRow] = await pool.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total 
       FROM money_receipts 
       WHERE MONTH(receipt_date) = ? AND YEAR(receipt_date) = ? AND status = 'ISSUED'`,
      [currentMonth, currentYear]
    );

    // 5. Total Cash & Bank Balances
    const [cashRow] = await pool.query(`SELECT COALESCE(SUM(current_balance), 0) as total FROM bank_accounts WHERE is_active = 1`);

    // 6. Recent 5 Donations
    const [recentDonations] = await pool.query(
      `SELECT d.id, d.receipt_number, COALESCE(dn.full_name, 'Anonymous Devotee') as donor_name, d.donation_for, d.amount, d.currency, d.payment_date, d.payment_status
       FROM donations d
       LEFT JOIN donors dn ON d.donor_id = dn.id
       WHERE d.is_deleted = 0
       ORDER BY d.payment_date DESC, d.id DESC LIMIT 5`
    );

    // 7. Recent 5 Receipts
    const [recentReceipts] = await pool.query(
      `SELECT id, receipt_number, recipient_name, amount, currency, receipt_date, status
       FROM money_receipts
       ORDER BY receipt_date DESC, id DESC LIMIT 5`
    );

    // 8. Low Stock Items (Live Inventory)
    const [lowStockItems] = await pool.query(
      `SELECT si.id, si.item_code, si.item_name, c.name as category_name, si.current_stock, si.min_stock, u.symbol as unit_symbol
       FROM store_items si
       JOIN categories c ON si.category_id = c.id
       JOIN units u ON si.unit_id = u.id
       WHERE si.current_stock <= si.min_stock
       ORDER BY si.current_stock ASC LIMIT 4`
    );

    // 9. Monthly Donations Breakdown for Chart (Last 6 Calendar Months)
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: d.toLocaleString('en-US', { month: 'short' }),
        month_num: d.getMonth() + 1,
        year: d.getFullYear(),
        donations: 0,
        donors: 0
      });
    }

    const [monthlyDbRows] = await pool.query(
      `SELECT 
         MONTH(payment_date) as month_num,
         YEAR(payment_date) as year,
         COALESCE(SUM(amount), 0) as donations,
         COUNT(DISTINCT donor_id) as donors
       FROM donations
       WHERE payment_status = 'completed' AND is_deleted = 0
         AND payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY year, month_num`
    );

    monthlyDbRows.forEach(row => {
      const target = months.find(m => m.month_num === row.month_num && m.year === row.year);
      if (target) {
        target.donations = parseFloat(row.donations);
        target.donors = parseInt(row.donors, 10);
      }
    });

    return res.json({
      success: true,
      data: {
        totalDonationsMonth: parseFloat(monthDonationRow[0].total) || 0,
        totalDonationsCount: monthDonationRow[0].count || 0,
        totalDonationsAllTime: parseFloat(allDonationRow[0].total) || 0,
        totalDonors: donorRow[0].count || 0,
        totalStudentsMonks: monkRow[0].count || 0,
        totalReceiptsMonth: receiptRow[0].count || 0,
        totalReceiptsValue: parseFloat(receiptRow[0].total) || 0,
        totalCashBalance: parseFloat(cashRow[0].total) || 0,
        recentDonations,
        recentReceipts,
        lowStockItems,
        monthlyTrend: months.map(m => ({
          month: m.month,
          donations: m.donations,
          donors: m.donors,
          amount: m.donations
        }))
      }
    });
  } catch (error) {
    console.error('[Dashboard Metrics Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard metrics' });
  }
}

module.exports = {
  getReports,
  getAdminDashboardMetrics
};
