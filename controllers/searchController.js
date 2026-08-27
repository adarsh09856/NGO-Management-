const { pool } = require('../config/db');

// Global Search (Top Bar)
async function globalSearch(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: { donors: [], students: [], receipts: [], items: [], projects: [] } });
    }

    const term = `%${q.trim()}%`;

    // 1. Donors
    const [donors] = await pool.query(
      `SELECT id, full_name as title, email as subtitle, 'Donor' as type, CONCAT('/admin/donors/', id) as link
       FROM donors 
       WHERE full_name LIKE ? OR email LIKE ? OR phone LIKE ? LIMIT 5`,
      [term, term, term]
    );

    // 2. Students & Monks
    const [students] = await pool.query(
      `SELECT id, monastic_name as title, roll_number as subtitle, 'Monk / Student' as type, '/admin/students' as link
       FROM students_monks 
       WHERE monastic_name LIKE ? OR secular_name LIKE ? OR roll_number LIKE ? LIMIT 5`,
      [term, term, term]
    );

    // 3. Money Receipts
    const [receipts] = await pool.query(
      `SELECT id, receipt_number as title, CONCAT(recipient_name, ' - ₹', amount) as subtitle, 'Receipt' as type, '/admin/receipts' as link
       FROM money_receipts 
       WHERE receipt_number LIKE ? OR recipient_name LIKE ? LIMIT 5`,
      [term, term]
    );

    // 4. Store Items
    const [items] = await pool.query(
      `SELECT id, item_name as title, CONCAT(item_code, ' - Stock: ', current_stock) as subtitle, 'Store Item' as type, '/admin/inventory' as link
       FROM store_items 
       WHERE item_name LIKE ? OR item_code LIKE ? LIMIT 5`,
      [term, term]
    );

    // 5. Projects
    const [projects] = await pool.query(
      `SELECT id, title, category as subtitle, 'Project' as type, '/admin/projects' as link
       FROM projects 
       WHERE title LIKE ? OR project_code LIKE ? LIMIT 5`,
      [term, term]
    );

    return res.json({
      success: true,
      data: {
        donors,
        students,
        receipts,
        items,
        projects
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Global search failed' });
  }
}

module.exports = {
  globalSearch
};
