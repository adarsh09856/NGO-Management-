const { pool } = require('../config/db');
const { logAudit } = require('../middleware/auditLogger');
const fs = require('fs');
const path = require('path');

// Projects CRUD
async function getProjects(req, res) {
  try {
    const [projects] = await pool.query(
      `SELECT p.*, 
              COUNT(pt.id) as total_tasks,
              SUM(CASE WHEN pt.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks
       FROM projects p
       LEFT JOIN project_tasks pt ON p.id = pt.project_id
       GROUP BY p.id
       ORDER BY p.id ASC`
    );
    return res.json({ success: true, data: projects });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
}

async function createProject(req, res) {
  try {
    const { projectCode, title, category = 'Stupa Construction', description, estimatedBudget, startDate, targetCompletionDate, location, managerName } = req.body;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    const [result] = await pool.query(
      `INSERT INTO projects (project_code, title, slug, category, description, estimated_budget, start_date, target_completion_date, location, manager_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [projectCode, title, slug, category, description || null, estimatedBudget || 0, startDate || new Date().toISOString().slice(0, 10), targetCompletionDate || null, location || 'Gelephu, Bhutan', managerName || 'Ugyen Tshering']
    );

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'projects',
      action: 'create',
      recordId: result.insertId,
      details: { projectCode, title, estimatedBudget }
    });

    return res.status(201).json({ success: true, message: 'Project created successfully', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create project: ' + error.message });
  }
}

async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const { projectCode, title, category, description, estimatedBudget, actualExpenditure, startDate, targetCompletionDate, status, completionPercent, location, managerName } = req.body;

    const [existing] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await pool.query(
      `UPDATE projects 
       SET project_code = COALESCE(?, project_code),
           title = COALESCE(?, title),
           category = COALESCE(?, category),
           description = COALESCE(?, description),
           estimated_budget = COALESCE(?, estimated_budget),
           actual_expenditure = COALESCE(?, actual_expenditure),
           start_date = COALESCE(?, start_date),
           target_completion_date = COALESCE(?, target_completion_date),
           status = COALESCE(?, status),
           completion_percent = COALESCE(?, completion_percent),
           location = COALESCE(?, location),
           manager_name = COALESCE(?, manager_name),
           updated_at = NOW()
       WHERE id = ?`,
      [projectCode || null, title || null, category || null, description || null, estimatedBudget || null, actualExpenditure || null, startDate || null, targetCompletionDate || null, status || null, completionPercent !== undefined ? completionPercent : null, location || null, managerName || null, id]
    );

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'projects',
      action: 'update',
      recordId: id,
      details: { title, status, completionPercent }
    });

    return res.json({ success: true, message: 'Project updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update project: ' + error.message });
  }
}

async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await pool.query('DELETE FROM projects WHERE id = ?', [id]);

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'projects',
      action: 'delete',
      recordId: id,
      details: { title: existing[0].title, projectCode: existing[0].project_code }
    });

    return res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete project: ' + error.message });
  }
}

// Project Tasks
async function getAllTasks(req, res) {
  try {
    const [tasks] = await pool.query(
      `SELECT pt.*, p.title as project_title 
       FROM project_tasks pt
       LEFT JOIN projects p ON pt.project_id = p.id
       ORDER BY pt.id DESC`
    );
    return res.json({ success: true, data: tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch tasks: ' + error.message });
  }
}

async function createTask(req, res) {
  try {
    const { projectId, title, description, assignedTo, priority = 'medium', status = 'todo', dueDate } = req.body;
    if (!projectId || !title) {
      return res.status(400).json({ success: false, message: 'Project and Task title are required' });
    }
    const [result] = await pool.query(
      `INSERT INTO project_tasks (project_id, title, description, priority, status, due_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [projectId, title, description || null, priority, status, dueDate || null]
    );

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'project_tasks',
      action: 'create',
      recordId: result.insertId,
      details: { projectId, title, priority }
    });

    return res.status(201).json({ success: true, message: 'Task created successfully', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create task: ' + error.message });
  }
}

async function getTasksByProject(req, res) {
  try {
    const { id } = req.params;
    const [tasks] = await pool.query(
      `SELECT pt.*, e.full_name as assigned_employee_name, e.designation
       FROM project_tasks pt
       LEFT JOIN employees e ON pt.assigned_to_employee_id = e.id
       WHERE pt.project_id = ?
       ORDER BY pt.due_date ASC, pt.id ASC`,
      [id]
    );
    return res.json({ success: true, data: tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
}

async function updateTaskStatus(req, res) {
  try {
    const { taskId } = req.params;
    const { status, title, description, priority, dueDate, assignedToEmployeeId } = req.body;

    const [existing] = await pool.query('SELECT * FROM project_tasks WHERE id = ?', [taskId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await pool.query(
      `UPDATE project_tasks 
       SET status = COALESCE(?, status), 
           title = COALESCE(?, title),
           description = COALESCE(?, description),
           priority = COALESCE(?, priority),
           due_date = COALESCE(?, due_date),
           assigned_to_employee_id = COALESCE(?, assigned_to_employee_id),
           completed_at = CASE WHEN ? = 'completed' THEN NOW() ELSE completed_at END
       WHERE id = ?`,
      [status || null, title || null, description || null, priority || null, dueDate || null, assignedToEmployeeId || null, status || null, taskId]
    );

    return res.json({ success: true, message: 'Task updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update task' });
  }
}

async function deleteTask(req, res) {
  try {
    const { taskId } = req.params;
    const [existing] = await pool.query('SELECT * FROM project_tasks WHERE id = ?', [taskId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await pool.query('DELETE FROM project_tasks WHERE id = ?', [taskId]);

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'project_tasks',
      action: 'delete',
      recordId: taskId,
      details: { title: existing[0].title, projectId: existing[0].project_id }
    });

    return res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete task: ' + error.message });
  }
}

// Documents
async function getDocuments(req, res) {
  try {
    const { category } = req.query;
    let query = `SELECT d.*, u.full_name as uploader_name FROM documents d LEFT JOIN users u ON d.uploaded_by_user_id = u.id WHERE 1=1`;
    const params = [];
    if (category && category !== 'all') { query += ` AND d.category = ?`; params.push(category); }
    query += ` ORDER BY d.id DESC`;

    const [docs] = await pool.query(query, params);
    return res.json({ success: true, data: docs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
}

async function createDocument(req, res) {
  try {
    const { title, category = 'Legal', description } = req.body;
    let filePath = '';
    let fileSize = 0;
    let fileType = 'application/pdf';

    if (req.file) {
      filePath = `/uploads/${req.file.filename}`;
      fileSize = req.file.size;
      fileType = req.file.mimetype;
    } else if (req.body.filePath) {
      filePath = req.body.filePath;
      fileSize = req.body.fileSize || 0;
      fileType = req.body.fileType || 'application/pdf';
    }

    if (!title || !filePath) {
      return res.status(400).json({ success: false, message: 'Title and file are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO documents (title, category, file_path, file_size, file_type, uploaded_by_user_id, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, category, filePath, fileSize, fileType, req.user ? req.user.id : null, description || null]
    );

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'documents',
      action: 'upload',
      recordId: result.insertId,
      details: { title, category, filePath }
    });

    return res.status(201).json({ success: true, message: 'Document vaulted successfully', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to upload document: ' + error.message });
  }
}

async function updateDocument(req, res) {
  try {
    const { id } = req.params;
    const { title, category, description } = req.body;

    const [existing] = await pool.query('SELECT * FROM documents WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    await pool.query(
      `UPDATE documents 
       SET title = COALESCE(?, title), 
           category = COALESCE(?, category), 
           description = COALESCE(?, description) 
       WHERE id = ?`,
      [title || null, category || null, description || null, id]
    );

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'documents',
      action: 'update',
      recordId: id,
      details: { title, category }
    });

    return res.json({ success: true, message: 'Document updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update document: ' + error.message });
  }
}

async function deleteDocument(req, res) {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM documents WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const doc = existing[0];
    if (doc.file_path && doc.file_path.startsWith('/uploads/')) {
      const fullDiskPath = path.join(__dirname, '..', doc.file_path);
      if (fs.existsSync(fullDiskPath)) {
        try { fs.unlinkSync(fullDiskPath); } catch (e) { /* ignore unlink error */ }
      }
    }

    await pool.query('DELETE FROM documents WHERE id = ?', [id]);

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'documents',
      action: 'delete',
      recordId: id,
      details: { title: doc.title, filePath: doc.file_path }
    });

    return res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete document: ' + error.message });
  }
}

// Notices
async function getNotices(req, res) {
  try {
    const { audience, all } = req.query;
    let query = `SELECT n.*, u.full_name as author_name FROM notices n LEFT JOIN users u ON n.created_by = u.id WHERE 1=1`;
    const params = [];

    // If 'all' is not requested, only return published
    if (!all && !req.user) {
      query += ` AND n.is_published = 1`;
    }

    if (audience && audience !== 'all') {
      query += ` AND (n.target_audience = 'all' OR n.target_audience = ?)`;
      params.push(audience);
    }

    query += ` ORDER BY n.is_pinned DESC, n.published_date DESC, n.id DESC`;
    const [notices] = await pool.query(query, params);
    return res.json({ success: true, data: notices });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notices' });
  }
}

async function createNotice(req, res) {
  try {
    const { title, content, targetAudience = 'all', isPinned = 0, isPublished = 1, publishedDate = new Date().toISOString().slice(0, 10), expiresDate = null } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    const [result] = await pool.query(
      `INSERT INTO notices (title, slug, content, target_audience, is_pinned, is_published, published_date, expires_date, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, content, targetAudience, isPinned ? 1 : 0, isPublished ? 1 : 0, publishedDate, expiresDate, req.user ? req.user.id : null]
    );

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'notices',
      action: 'create',
      recordId: result.insertId,
      details: { title, targetAudience, isPinned, isPublished }
    });

    return res.status(201).json({ success: true, message: 'Notice created successfully', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create notice: ' + error.message });
  }
}

async function updateNotice(req, res) {
  try {
    const { id } = req.params;
    const { title, content, targetAudience, isPinned, isPublished, publishedDate, expiresDate } = req.body;

    const [existing] = await pool.query('SELECT * FROM notices WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    await pool.query(
      `UPDATE notices 
       SET title = COALESCE(?, title),
           content = COALESCE(?, content),
           target_audience = COALESCE(?, target_audience),
           is_pinned = COALESCE(?, is_pinned),
           is_published = COALESCE(?, is_published),
           published_date = COALESCE(?, published_date),
           expires_date = COALESCE(?, expires_date)
       WHERE id = ?`,
      [title || null, content || null, targetAudience || null, isPinned !== undefined ? isPinned : null, isPublished !== undefined ? isPublished : null, publishedDate || null, expiresDate || null, id]
    );

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'notices',
      action: 'update',
      recordId: id,
      details: { title, targetAudience, isPinned, isPublished }
    });

    return res.json({ success: true, message: 'Notice updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update notice: ' + error.message });
  }
}

async function deleteNotice(req, res) {
  try {
    const { id } = req.params;
    const [existing] = await pool.query('SELECT * FROM notices WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    await pool.query('DELETE FROM notices WHERE id = ?', [id]);

    logAudit({
      userId: req.user ? req.user.id : null,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'notices',
      action: 'delete',
      recordId: id,
      details: { title: existing[0].title }
    });

    return res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete notice: ' + error.message });
  }
}

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getAllTasks,
  createTask,
  getTasksByProject,
  updateTaskStatus,
  deleteTask,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice
};
