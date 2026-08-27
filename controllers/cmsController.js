const { pool } = require('../config/db');

// News & Events
async function getNewsEvents(req, res) {
  try {
    const { category } = req.query;
    let query = `SELECT * FROM news_events WHERE is_published = 1`;
    const params = [];
    if (category) { query += ` AND category = ?`; params.push(category); }
    query += ` ORDER BY event_date ASC, id DESC`;

    const [rows] = await pool.query(query, params);
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch news & events' });
  }
}

async function getNewsEventBySlug(req, res) {
  try {
    const { slug } = req.params;
    const [rows] = await pool.query(`SELECT * FROM news_events WHERE slug = ?`, [slug]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Article not found' });
    await pool.query(`UPDATE news_events SET views_count = views_count + 1 WHERE id = ?`, [rows[0].id]);
    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch article' });
  }
}

// Gallery Items
async function getGallery(req, res) {
  try {
    const { category } = req.query;
    let query = `SELECT * FROM gallery_items WHERE 1=1`;
    const params = [];
    if (category && category !== 'All') { query += ` AND category = ?`; params.push(category); }
    query += ` ORDER BY display_order ASC, id DESC`;

    const [rows] = await pool.query(query, params);
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch gallery' });
  }
}

// Devotee Prayer Requests
async function submitPrayerRequest(req, res) {
  try {
    const { devoteeName, devoteeEmail, devoteePhone, country = 'Bhutan', prayerType = 'World Peace', intentionText, butterLampsCount = 108, dedicationNames, offeringAmount = 0 } = req.body;

    if (!devoteeName || !intentionText) {
      return res.status(400).json({ success: false, message: 'Devotee name and prayer intention are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO prayer_requests (devotee_name, devotee_email, devotee_phone, country, prayer_type, intention_text, butter_lamps_count, dedication_names, offering_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [devoteeName, devoteeEmail || null, devoteePhone || null, country, prayerType, intentionText, butterLampsCount, dedicationNames || null, offeringAmount]
    );

    return res.status(201).json({
      success: true,
      message: 'Your sacred prayer request has been received. Our Sangha will dedicate prayers and light lamps for your intentions.',
      id: result.insertId
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit prayer request' });
  }
}

async function getPrayerRequests(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT pr.*, sm.monastic_name as dedicated_monk_name
       FROM prayer_requests pr
       LEFT JOIN students_monks sm ON pr.dedicated_by_monk_id = sm.id
       ORDER BY pr.id DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch prayer requests' });
  }
}

async function dedicatePrayerRequest(req, res) {
  try {
    const { id } = req.params;
    const { monkId } = req.body;

    await pool.query(
      `UPDATE prayer_requests 
       SET status = 'dedicated', 
           dedicated_by_monk_id = ?, 
           dedication_date = CURDATE() 
       WHERE id = ?`,
      [monkId || null, id]
    );

    return res.json({ success: true, message: 'Prayer request marked dedicated' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update prayer request' });
  }
}

module.exports = {
  getNewsEvents,
  getNewsEventBySlug,
  getGallery,
  submitPrayerRequest,
  getPrayerRequests,
  dedicatePrayerRequest
};
