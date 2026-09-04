const { pool } = require('../config/db');

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
      [projectCode, title, slug, category, description || null, estimatedBudget || 0, startDate || CURDATE(), targetCompletionDate || null, location || 'Gelephu, Bhutan', managerName || 'Ugyen Tshering']
    );

    return res.status(201).json({ success: true, message: 'Project created successfully', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create project: ' + error.message });
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
    const { projectId, title, assignedTo, priority = 'medium', status = 'pending', dueDate } = req.body;
    if (!projectId || !title) {
      return res.status(400).json({ success: false, message: 'Project and Task title are required' });
    }
    const [result] = await pool.query(
      `INSERT INTO project_tasks (project_id, title, assigned_to, priority, status, due_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [projectId, title, assignedTo || 'Monastery Site Team', priority, status, dueDate || null]
    );
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
    const { status } = req.body; // 'pending', 'in_progress', 'completed'

    await pool.query(
      `UPDATE project_tasks 
       SET status = ?, 
           completed_at = CASE WHEN ? = 'completed' THEN NOW() ELSE NULL END
       WHERE id = ?`,
      [status, status, taskId]
    );

    return res.json({ success: true, message: `Task status updated to ${status}` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update task status' });
  }
}

// Documents
async function getDocuments(req, res) {
  try {
    const { category } = req.query;
    let query = `SELECT d.*, u.full_name as uploader_name FROM documents d LEFT JOIN users u ON d.uploaded_by_user_id = u.id WHERE 1=1`;
    const params = [];
    if (category) { query += ` AND d.category = ?`; params.push(category); }
    query += ` ORDER BY d.id DESC`;

    const [docs] = await pool.query(query, params);
    return res.json({ success: true, data: docs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
}

// Notices
async function getNotices(req, res) {
  try {
    const { audience } = req.query;
    let query = `SELECT * FROM notices WHERE is_published = 1`;
    const params = [];

    if (audience && audience !== 'all') {
      query += ` AND (target_audience = 'all' OR target_audience = ?)`;
      params.push(audience);
    }

    query += ` ORDER BY is_pinned DESC, published_date DESC`;
    const [notices] = await pool.query(query, params);
    return res.json({ success: true, data: notices });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notices' });
  }
}

module.exports = {
  getProjects,
  createProject,
  getAllTasks,
  createTask,
  getTasksByProject,
  updateTaskStatus,
  getDocuments,
  getNotices
};
