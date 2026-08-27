const { pool } = require('../config/db');
const { logAudit } = require('../middleware/auditLogger');

// Employees Directory
async function getEmployees(req, res) {
  try {
    const { department, status, search } = req.query;
    let query = `SELECT * FROM employees WHERE 1=1`;
    const params = [];

    if (department) { query += ` AND department = ?`; params.push(department); }
    if (status) { query += ` AND status = ?`; params.push(status); }
    if (search) {
      query += ` AND (full_name LIKE ? OR employee_code LIKE ? OR designation LIKE ?)`;
      const p = `%${search}%`;
      params.push(p, p, p);
    }

    query += ` ORDER BY id ASC`;
    const [employees] = await pool.query(query, params);
    return res.json({ success: true, data: employees });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch employees' });
  }
}

async function createEmployee(req, res) {
  try {
    const { employeeCode, fullName, email, phone, designation, department = 'Admin & Finance', employmentType = 'Full-Time', basicSalary = 0, bankAccountNo, bankName } = req.body;

    if (!employeeCode || !fullName || !designation) {
      return res.status(400).json({ success: false, message: 'Employee code, full name, and designation are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO employees (employee_code, full_name, email, phone, designation, department, employment_type, basic_salary, joining_date, bank_account_no, bank_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), ?, ?)`,
      [employeeCode, fullName, email || null, phone || null, designation, department, employmentType, basicSalary, bankAccountNo || null, bankName || 'Bank of Bhutan']
    );

    return res.status(201).json({ success: true, message: 'Employee created successfully', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create employee: ' + error.message });
  }
}

// Attendance Marking
async function getAttendance(req, res) {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const [records] = await pool.query(
      `SELECT ae.*, e.full_name, e.employee_code, e.designation, e.department
       FROM attendance_employees ae
       JOIN employees e ON ae.employee_id = e.id
       WHERE ae.attendance_date = ?
       ORDER BY e.id ASC`,
      [date]
    );
    return res.json({ success: true, data: records, date });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch attendance' });
  }
}

async function markAttendance(req, res) {
  try {
    const { attendanceDate, records } = req.body; // records: [ { employeeId, status, remarks } ]

    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ success: false, message: 'Attendance records array required' });
    }

    const date = attendanceDate || new Date().toISOString().slice(0, 10);
    const userId = req.user ? req.user.id : null;

    for (const rec of records) {
      await pool.query(
        `INSERT INTO attendance_employees (employee_id, attendance_date, status, remarks, marked_by)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), remarks = VALUES(remarks), marked_by = VALUES(marked_by)`,
        [rec.employeeId, date, rec.status || 'present', rec.remarks || null, userId]
      );
    }

    return res.json({ success: true, message: `Attendance marked for ${records.length} employees on ${date}` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to mark attendance' });
  }
}

// Leave Requests
async function getLeaveRequests(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT lr.*, e.full_name, e.employee_code, e.designation
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       ORDER BY lr.id DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch leave requests' });
  }
}

async function submitLeaveRequest(req, res) {
  try {
    const { employeeId, leaveType = 'casual', startDate, endDate, totalDays, reason } = req.body;

    if (!employeeId || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Employee ID, dates, and reason are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, total_days, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [employeeId, leaveType, startDate, endDate, totalDays || 1, reason]
    );

    return res.status(201).json({ success: true, message: 'Leave request submitted for review', id: result.insertId });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit leave request' });
  }
}

async function approveLeaveRequest(req, res) {
  try {
    const { id } = req.params;
    const { status, reviewRemarks } = req.body; // 'approved' or 'rejected'

    await pool.query(
      `UPDATE leave_requests 
       SET status = ?, 
           reviewed_by = ?, 
           reviewed_at = NOW(),
           review_remarks = ?
       WHERE id = ?`,
      [status, req.user ? req.user.id : null, reviewRemarks || null, id]
    );

    return res.json({ success: true, message: `Leave request ${status}` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to review leave request' });
  }
}

module.exports = {
  getEmployees,
  createEmployee,
  getAttendance,
  markAttendance,
  getLeaveRequests,
  submitLeaveRequest,
  approveLeaveRequest
};
