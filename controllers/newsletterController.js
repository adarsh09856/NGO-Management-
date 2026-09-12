const crypto = require('crypto');
const { pool } = require('../config/db');
const { logAudit } = require('../middleware/auditLogger');

/**
 * Public Newsletter Subscription
 * Generates secure 64-char unsubscribe token and handles resubscription
 */
async function subscribe(req, res, next) {
  try {
    const { email, fullName, full_name } = req.body;
    const subscriberEmail = (email || '').trim().toLowerCase();
    const subscriberName = (fullName || full_name || '').trim() || null;

    if (!subscriberEmail) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(subscriberEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    // Check if subscriber already exists
    const [existing] = await pool.query(
      'SELECT id, status, unsubscribe_token FROM newsletter_subscribers WHERE email = ?',
      [subscriberEmail]
    );

    const token = crypto.randomBytes(32).toString('hex');

    if (existing.length > 0) {
      if (existing[0].status === 'subscribed') {
        return res.json({
          success: true,
          message: 'You are already subscribed to our newsletter updates.'
        });
      } else {
        // Re-activate previously unsubscribed entry
        await pool.query(
          `UPDATE newsletter_subscribers 
           SET status = 'subscribed', 
               unsubscribe_token = ?, 
               unsubscribed_at = NULL, 
               full_name = COALESCE(?, full_name)
           WHERE id = ?`,
          [token, subscriberName, existing[0].id]
        );
        return res.json({
          success: true,
          message: 'Welcome back! Your newsletter subscription has been renewed.'
        });
      }
    }

    // New subscription
    const [result] = await pool.query(
      `INSERT INTO newsletter_subscribers (email, full_name, status, unsubscribe_token)
       VALUES (?, ?, 'subscribed', ?)`,
      [subscriberEmail, subscriberName, token]
    );

    return res.status(200).json({
      success: true,
      message: 'Thank you for subscribing to our foundation news and dharma dispatches!',
      id: result.insertId
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Public Newsletter Unsubscribe
 * Accepts token via query param or body
 */
async function unsubscribe(req, res, next) {
  try {
    const token = req.query.token || req.body.token;

    if (!token || typeof token !== 'string' || token.trim().length !== 64) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing unsubscribe token.'
      });
    }

    const [rows] = await pool.query(
      'SELECT id, email, status FROM newsletter_subscribers WHERE unsubscribe_token = ?',
      [token.trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No subscriber found for this unsubscribe link.'
      });
    }

    if (rows[0].status === 'unsubscribed') {
      return res.json({
        success: true,
        message: 'You have already been unsubscribed from this newsletter.'
      });
    }

    await pool.query(
      `UPDATE newsletter_subscribers 
       SET status = 'unsubscribed', 
           unsubscribed_at = NOW() 
       WHERE id = ?`,
      [rows[0].id]
    );

    return res.json({
      success: true,
      message: 'You have been successfully unsubscribed from all future newsletter updates.'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get All Newsletter Subscribers (Admin / Super Admin)
 */
async function getSubscribers(req, res, next) {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT id, email, full_name, status, created_at AS subscribed_at, created_at, unsubscribed_at FROM newsletter_subscribers WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await pool.query(query, params);
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM newsletter_subscribers WHERE 1=1' +
      (status && status !== 'all' ? ` AND status = '${status.replace(/'/g, "''")}'` : '')
    );

    return res.json({
      success: true,
      data: rows,
      total,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  subscribe,
  unsubscribe,
  getSubscribers
};
