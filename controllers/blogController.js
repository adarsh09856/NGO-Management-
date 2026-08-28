const { pool } = require('../config/db');

// 1. Get Published Blog Posts (Public with pagination, search, tags)
async function getBlogPosts(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '9', 10);
    const offset = (page - 1) * limit;
    const search = req.query.q || '';
    const tag = req.query.tag || '';
    const status = req.query.status || 'published';

    let query = 'SELECT id, title, slug, summary, cover_image, author_name, tags, views_count, published_at, created_at FROM blog_posts WHERE 1=1';
    const params = [];

    // If request is from admin with specific status filter
    if (req.user && req.query.all) {
      if (status !== 'all') {
        query += ' AND status = ?';
        params.push(status);
      }
    } else {
      query += " AND status = 'published'";
    }

    if (search) {
      query += ' AND (title LIKE ? OR summary LIKE ? OR content LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (tag) {
      query += ' AND tags LIKE ?';
      params.push(`%${tag}%`);
    }

    // Count Total
    const countSql = query.replace('SELECT id, title, slug, summary, cover_image, author_name, tags, views_count, published_at, created_at', 'SELECT COUNT(*) as total');
    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0]?.total || 0;

    query += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

// 2. Get Single Blog Post by Slug (Public)
async function getBlogPostBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const [rows] = await pool.query('SELECT * FROM blog_posts WHERE slug = ?', [slug]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Blog article not found' });
    }

    const post = rows[0];

    // Increment views
    await pool.query('UPDATE blog_posts SET views_count = views_count + 1 WHERE id = ?', [post.id]);

    // Fetch related articles (same tags or recent)
    const [related] = await pool.query(
      'SELECT id, title, slug, summary, cover_image, published_at FROM blog_posts WHERE id != ? AND status = "published" ORDER BY published_at DESC LIMIT 3',
      [post.id]
    );

    res.json({
      success: true,
      data: {
        ...post,
        views_count: post.views_count + 1,
        related
      }
    });
  } catch (error) {
    next(error);
  }
}

// 3. Create Blog Post (Admin)
async function createBlogPost(req, res, next) {
  try {
    const {
      title,
      slug,
      summary,
      content,
      cover_image,
      author_name,
      status = 'published',
      tags = 'Buddhism, Bhutan, Peace Stupa'
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const generatedSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const authorId = req.user?.id || 1;
    const author = author_name || req.user?.fullName || 'Khenpo Tashi Dorji';

    const [result] = await pool.query(
      `INSERT INTO blog_posts (title, slug, summary, content, cover_image, author_id, author_name, status, tags, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [title, generatedSlug, summary || '', content, cover_image || '', authorId, author, status, tags]
    );

    res.status(201).json({
      success: true,
      message: 'Blog article published successfully',
      data: { id: result.insertId, slug: generatedSlug }
    });
  } catch (error) {
    next(error);
  }
}

// 4. Update Blog Post (Admin)
async function updateBlogPost(req, res, next) {
  try {
    const { id } = req.params;
    const {
      title,
      summary,
      content,
      cover_image,
      author_name,
      status,
      tags
    } = req.body;

    const [existing] = await pool.query('SELECT * FROM blog_posts WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    await pool.query(
      `UPDATE blog_posts SET 
        title = COALESCE(?, title),
        summary = COALESCE(?, summary),
        content = COALESCE(?, content),
        cover_image = COALESCE(?, cover_image),
        author_name = COALESCE(?, author_name),
        status = COALESCE(?, status),
        tags = COALESCE(?, tags),
        updated_at = NOW()
       WHERE id = ?`,
      [title, summary, content, cover_image, author_name, status, tags, id]
    );

    res.json({
      success: true,
      message: 'Blog article updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

// 5. Delete Blog Post (Admin)
async function deleteBlogPost(req, res, next) {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM blog_posts WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Blog article deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
};
