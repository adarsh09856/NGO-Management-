const { pool } = require('../config/db');

// 1. Get Learning Materials (Public video library & lectures)
async function getLearningMaterials(req, res, next) {
  try {
    const category = req.query.category || '';
    const search = req.query.q || '';

    let query = 'SELECT * FROM learning_materials WHERE is_published = 1';
    const params = [];

    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR instructor LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY display_order ASC, created_at DESC';

    const [rows] = await pool.query(query, params);

    // Get distinct categories
    const [categories] = await pool.query(
      'SELECT DISTINCT category FROM learning_materials WHERE is_published = 1 ORDER BY category ASC'
    );

    res.json({
      success: true,
      data: rows,
      categories: ['All', ...categories.map(c => c.category)]
    });
  } catch (error) {
    next(error);
  }
}

// 2. Create Learning Video / Material (Admin)
async function createLearningMaterial(req, res, next) {
  try {
    const {
      title,
      description,
      category = 'Buddhist Philosophy',
      media_type = 'video_url',
      media_url,
      thumbnail_url,
      instructor = 'Khenpo Tashi Dorji',
      duration = '45 mins',
      display_order = 0
    } = req.body;

    if (!title || !media_url) {
      return res.status(400).json({
        success: false,
        message: 'Title and video file or link (media_url) are required'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO learning_materials (title, description, category, media_type, media_url, thumbnail_url, instructor, duration, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || '',
        category,
        media_type,
        media_url,
        thumbnail_url || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
        instructor,
        duration,
        display_order
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Learning video added successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    next(error);
  }
}

// 3. Update Learning Material (Admin)
async function updateLearningMaterial(req, res, next) {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      media_type,
      media_url,
      thumbnail_url,
      instructor,
      duration,
      is_published,
      display_order
    } = req.body;

    await pool.query(
      `UPDATE learning_materials SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        media_type = COALESCE(?, media_type),
        media_url = COALESCE(?, media_url),
        thumbnail_url = COALESCE(?, thumbnail_url),
        instructor = COALESCE(?, instructor),
        duration = COALESCE(?, duration),
        is_published = COALESCE(?, is_published),
        display_order = COALESCE(?, display_order),
        updated_at = NOW()
       WHERE id = ?`,
      [title, description, category, media_type, media_url, thumbnail_url, instructor, duration, is_published, display_order, id]
    );

    res.json({
      success: true,
      message: 'Learning material updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

// 4. Delete Learning Material (Admin)
async function deleteLearningMaterial(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM learning_materials WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Learning video deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getLearningMaterials,
  createLearningMaterial,
  updateLearningMaterial,
  deleteLearningMaterial
};
