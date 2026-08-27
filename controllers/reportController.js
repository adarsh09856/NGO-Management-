const { pool } = require('../config/db');

// Reports Hub Analytics & CSV Export
async function getReports(req, res) {
  try {
    const { module = 'donations', format = 'json', startDate, endDate } = req.query;

    if (module === 'donations') {
      const [rows] = await pool.query(
        `SELECT d.receipt_number, dn.full_name as donor_name, dn.email, d.donation_for, d.amount, d.currency, d.payment_method, d.payment_date, d.payment_status
         FROM donations d
         JOIN donors dn ON d.donor_id = dn.id
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

    if (module === 'accounts') {
      const [incomeRows] = await pool.query(`SELECT source_category, SUM(amount) as total FROM income GROUP BY source_category`);
      const [expenseRows] = await pool.query(`SELECT ec.name as category, SUM(e.amount) as total FROM expenses e JOIN expense_categories ec ON e.category_id = ec.id GROUP BY ec.id`);
      return res.json({ success: true, data: { incomeBySource: incomeRows, expensesByCategory: expenseRows } });
    }

    if (module === 'inventory') {
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

    if (module === 'hrm') {
      const [rows] = await pool.query(
        `SELECT e.employee_code, e.full_name, e.designation, e.department, e.basic_salary, e.status
         FROM employees e
         ORDER BY e.id ASC`
      );
      return res.json({ success: true, data: rows });
    }

    return res.status(400).json({ success: false, message: 'Invalid report module' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
}

module.exports = {
  getReports
};
