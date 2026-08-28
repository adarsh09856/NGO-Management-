const { pool } = require('../config/db');

// ==========================================
// 1. NEWS & EVENTS (CMS)
// ==========================================
async function getNewsEvents(req, res, next) {
  try {
    const { category } = req.query;
    let query = `SELECT * FROM news_events WHERE is_published = 1`;
    const params = [];
    if (category) { query += ` AND category = ?`; params.push(category); }
    query += ` ORDER BY event_date ASC, id DESC`;

    const [rows] = await pool.query(query, params);
    return res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

async function getNewsEventBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const [rows] = await pool.query(`SELECT * FROM news_events WHERE slug = ?`, [slug]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Article not found' });
    await pool.query(`UPDATE news_events SET views_count = views_count + 1 WHERE id = ?`, [rows[0].id]);
    return res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 2. GALLERY ITEMS (Photos, Video Files & URLs)
// ==========================================
async function getGallery(req, res, next) {
  try {
    const { category, type } = req.query;
    let query = `SELECT * FROM gallery_items WHERE 1=1`;
    const params = [];

    if (category && category !== 'All') {
      query += ` AND category = ?`;
      params.push(category);
    }

    if (type && type !== 'All') {
      if (type === 'Photos') {
        query += ` AND media_type = 'image'`;
      } else if (type === 'Videos') {
        query += ` AND (media_type = 'video_upload' OR media_type = 'video_url')`;
      }
    }

    query += ` ORDER BY display_order ASC, id DESC`;

    const [rows] = await pool.query(query, params);
    return res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

async function createGalleryItem(req, res, next) {
  try {
    const {
      title,
      category = 'Stupa Construction',
      media_type = 'image', // 'image', 'video_upload', 'video_url'
      media_url,
      thumbnail_url,
      caption,
      display_order = 0,
      is_featured = 1
    } = req.body;

    if (!title || !media_url) {
      return res.status(400).json({ success: false, message: 'Title and media URL or file are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO gallery_items (title, category, media_type, media_url, thumbnail_url, caption, display_order, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, category, media_type, media_url, thumbnail_url || media_url, caption || '', display_order, is_featured ? 1 : 0]
    );

    res.status(201).json({
      success: true,
      message: 'Gallery item added successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

async function updateGalleryItem(req, res, next) {
  try {
    const { id } = req.params;
    const { title, category, media_type, media_url, thumbnail_url, caption, display_order, is_featured } = req.body;

    await pool.query(
      `UPDATE gallery_items SET
        title = COALESCE(?, title),
        category = COALESCE(?, category),
        media_type = COALESCE(?, media_type),
        media_url = COALESCE(?, media_url),
        thumbnail_url = COALESCE(?, thumbnail_url),
        caption = COALESCE(?, caption),
        display_order = COALESCE(?, display_order),
        is_featured = COALESCE(?, is_featured)
       WHERE id = ?`,
      [title, category, media_type, media_url, thumbnail_url, caption, display_order, is_featured, id]
    );

    res.json({ success: true, message: 'Gallery item updated successfully' });
  } catch (error) {
    next(error);
  }
}

async function deleteGalleryItem(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM gallery_items WHERE id = ?', [id]);
    res.json({ success: true, message: 'Gallery item deleted successfully' });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 3. DEVOTEE PRAYER REQUESTS & BUTTER LAMPS
// ==========================================
async function submitPrayerRequest(req, res, next) {
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
    next(error);
  }
}

async function getPrayerRequests(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT pr.*, sm.monastic_name as dedicated_monk_name
       FROM prayer_requests pr
       LEFT JOIN students_monks sm ON pr.dedicated_by_monk_id = sm.id
       ORDER BY pr.id DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

async function dedicatePrayerRequest(req, res, next) {
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
    next(error);
  }
}

module.exports = {
  getNewsEvents,
  getNewsEventBySlug,
  getGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  submitPrayerRequest,
  getPrayerRequests,
  dedicatePrayerRequest
};
