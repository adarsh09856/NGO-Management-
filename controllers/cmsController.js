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

async function createNewsEvent(req, res, next) {
  try {
    const {
      title,
      category = 'News',
      summary,
      content,
      eventDate,
      event_date,
      eventTime,
      event_time,
      location,
      eventType = 'In-Person',
      event_type,
      bannerImage,
      banner_image,
      isPublished = 1,
      is_published
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    const finalDate = eventDate || event_date || null;
    const finalTime = eventTime || event_time || null;
    const finalType = eventType || event_type || 'In-Person';
    const finalBanner = bannerImage || banner_image || null;
    const finalPub = isPublished !== undefined ? (isPublished ? 1 : 0) : (is_published !== undefined ? (is_published ? 1 : 0) : 1);

    const [result] = await pool.query(
      `INSERT INTO news_events (title, slug, category, summary, content, event_date, event_time, location, event_type, banner_image, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, category, summary || content.slice(0, 160), content, finalDate, finalTime, location || 'Great Druk Wangyel Peace Stupa Complex', finalType, finalBanner, finalPub]
    );

    return res.status(201).json({
      success: true,
      message: 'News & Event published successfully',
      id: result.insertId,
      slug
    });
  } catch (error) {
    next(error);
  }
}

async function updateNewsEvent(req, res, next) {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      summary,
      content,
      eventDate,
      event_date,
      eventTime,
      event_time,
      location,
      eventType,
      event_type,
      bannerImage,
      banner_image,
      isPublished,
      is_published
    } = req.body;

    const [existing] = await pool.query('SELECT * FROM news_events WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'News & Event record not found' });
    }

    const finalDate = eventDate !== undefined ? eventDate : (event_date !== undefined ? event_date : existing[0].event_date);
    const finalTime = eventTime !== undefined ? eventTime : (event_time !== undefined ? event_time : existing[0].event_time);
    const finalType = eventType !== undefined ? eventType : (event_type !== undefined ? event_type : existing[0].event_type);
    const finalBanner = bannerImage !== undefined ? bannerImage : (banner_image !== undefined ? banner_image : existing[0].banner_image);
    const finalPub = isPublished !== undefined ? (isPublished ? 1 : 0) : (is_published !== undefined ? (is_published ? 1 : 0) : existing[0].is_published);

    await pool.query(
      `UPDATE news_events SET
        title = COALESCE(?, title),
        category = COALESCE(?, category),
        summary = COALESCE(?, summary),
        content = COALESCE(?, content),
        event_date = ?,
        event_time = ?,
        location = COALESCE(?, location),
        event_type = ?,
        banner_image = ?,
        is_published = ?
       WHERE id = ?`,
      [title || null, category || null, summary || null, content || null, finalDate, finalTime, location || null, finalType, finalBanner, finalPub, id]
    );

    return res.json({ success: true, message: 'News & Event updated successfully' });
  } catch (error) {
    next(error);
  }
}

async function deleteNewsEvent(req, res, next) {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM news_events WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'News & Event record not found' });
    }

    await pool.query('DELETE FROM news_events WHERE id = ?', [id]);
    return res.json({ success: true, message: 'News & Event deleted successfully' });
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
      id: result.insertId,
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

    const finalName = devoteeName || req.body.fullName || req.body.name;
    const finalEmail = devoteeEmail || req.body.email;
    const finalPhone = devoteePhone || req.body.phone;
    const finalIntention = intentionText || req.body.dedicationPrayer || req.body.message;
    const finalLamps = butterLampsCount !== undefined ? butterLampsCount : (req.body.butterLamps || 108);

    if (!finalName || !finalIntention) {
      return res.status(400).json({ success: false, message: 'Devotee name and prayer intention are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO prayer_requests (devotee_name, devotee_email, devotee_phone, country, prayer_type, intention_text, butter_lamps_count, dedication_names, offering_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [finalName, finalEmail || null, finalPhone || null, country, prayerType, finalIntention, finalLamps, dedicationNames || null, offeringAmount]
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
    const { monkId, status = 'dedicated' } = req.body;

    await pool.query(
      `UPDATE prayer_requests 
       SET status = ?, 
           dedicated_by_monk_id = COALESCE(?, dedicated_by_monk_id), 
           dedication_date = CASE WHEN ? = 'dedicated' THEN CURDATE() ELSE dedication_date END 
       WHERE id = ?`,
      [status, monkId || null, status, id]
    );

    return res.json({ success: true, message: `Prayer request updated to ${status}` });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 4. EVENT RSVPS
// ==========================================
async function submitEventRsvp(req, res, next) {
  try {
    const { eventId, event_id, guestName, guest_name, guestEmail, guest_email, guestPhone, guest_phone, attendingCount, attending_count, specialRequests, special_requests } = req.body;
    
    const targetEventId = eventId || event_id;
    const name = (guestName || guest_name || '').trim();
    const email = (guestEmail || guest_email || '').trim().toLowerCase();
    const phone = guestPhone || guest_phone || null;
    const count = parseInt(attendingCount || attending_count || 1, 10);
    const requests = specialRequests || special_requests || null;

    if (!targetEventId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Event ID, guest name, and guest email are required.'
      });
    }

    if (count < 1 || count > 20) {
      return res.status(400).json({
        success: false,
        message: 'Attending count must be between 1 and 20.'
      });
    }

    // Verify event exists
    const [events] = await pool.query('SELECT id, title FROM news_events WHERE id = ?', [targetEventId]);
    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const userId = req.user ? req.user.id : null;

    const [result] = await pool.query(
      `INSERT INTO event_rsvps (event_id, user_id, guest_name, guest_email, guest_phone, attending_count, special_requests, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
      [targetEventId, userId, name, email, phone, count, requests]
    );

    return res.status(201).json({
      success: true,
      message: 'RSVP confirmed! We look forward to welcoming you.',
      id: result.insertId
    });
  } catch (error) {
    next(error);
  }
}

async function getEventRsvps(req, res, next) {
  try {
    const { eventId } = req.params;
    const [rows] = await pool.query(
      `SELECT r.*, ne.title as event_title 
       FROM event_rsvps r
       JOIN news_events ne ON r.event_id = ne.id
       WHERE r.event_id = ?
       ORDER BY r.created_at DESC`,
      [eventId]
    );

    const [[totals]] = await pool.query(
      `SELECT 
         COUNT(*) as total_rsvps,
         COALESCE(SUM(CASE WHEN status != 'cancelled' THEN attending_count ELSE 0 END), 0) as total_attendees
       FROM event_rsvps 
       WHERE event_id = ?`,
      [eventId]
    );

    return res.json({
      success: true,
      data: rows,
      summary: totals
    });
  } catch (error) {
    next(error);
  }
}

async function updateRsvpStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['confirmed', 'cancelled', 'attended'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
      });
    }

    const [existing] = await pool.query('SELECT * FROM event_rsvps WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'RSVP record not found.' });
    }

    await pool.query('UPDATE event_rsvps SET status = ? WHERE id = ?', [status, id]);

    return res.json({ success: true, message: 'RSVP status updated successfully.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNewsEvents,
  getNewsEventBySlug,
  createNewsEvent,
  updateNewsEvent,
  deleteNewsEvent,
  getGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  submitPrayerRequest,
  getPrayerRequests,
  dedicatePrayerRequest,
  submitEventRsvp,
  getEventRsvps,
  updateRsvpStatus
};

