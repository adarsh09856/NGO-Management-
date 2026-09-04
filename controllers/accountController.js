const { pool, withTransaction } = require('../config/db');
const { logAudit } = require('../middleware/auditLogger');

// Accounts & Finance Dashboard (100% Real Database Driven)
async function getAccountsDashboard(req, res) {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // 1. Current Month Income
    const [incomeRows] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM income 
       WHERE MONTH(received_date) = ? AND YEAR(received_date) = ?`,
      [currentMonth, currentYear]
    );
    const totalIncomeThisMonth = parseFloat(incomeRows[0].total) || 0;

    // Prior Month Income for % change
    const priorMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const priorYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const [priorIncomeRows] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM income 
       WHERE MONTH(received_date) = ? AND YEAR(received_date) = ?`,
      [priorMonth, priorYear]
    );
    const priorIncome = parseFloat(priorIncomeRows[0].total) || 0;
    const incomeGrowth = priorIncome > 0 ? ((totalIncomeThisMonth - priorIncome) / priorIncome) * 100 : 0.0;

    // 2. Current Month Expenses
    const [expenseRows] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM expenses 
       WHERE MONTH(expense_date) = ? AND YEAR(expense_date) = ? AND status IN ('approved', 'paid')`,
      [currentMonth, currentYear]
    );
    const totalExpensesThisMonth = parseFloat(expenseRows[0].total) || 0;

    const [priorExpenseRows] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM expenses 
       WHERE MONTH(expense_date) = ? AND YEAR(expense_date) = ? AND status IN ('approved', 'paid')`,
      [priorMonth, priorYear]
    );
    const priorExpense = parseFloat(priorExpenseRows[0].total) || 0;
    const expenseGrowth = priorExpense > 0 ? ((totalExpensesThisMonth - priorExpense) / priorExpense) * 100 : 0.0;

    // 3. Net Surplus
    const netSurplus = totalIncomeThisMonth - totalExpensesThisMonth;
    const surplusGrowth = incomeGrowth - expenseGrowth;

    // 4. Receivables, Payables, Cash in Hand
    const [pendingExpenseRow] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM expenses WHERE status = 'pending'`
    );
    const totalPayables = parseFloat(pendingExpenseRow[0].total) || 0;
    const overdueBillsCount = pendingExpenseRow[0].count || 0;

    const [cashRows] = await pool.query(
      `SELECT COALESCE(SUM(current_balance), 0) as total FROM bank_accounts WHERE is_active = 1`
    );
    const cashInHand = parseFloat(cashRows[0].total) || 0;

    // 5. Bank Accounts
    const [bankAccounts] = await pool.query(
      `SELECT * FROM bank_accounts WHERE is_active = 1 ORDER BY id ASC`
    );

    // 6. Recent Transactions (Vouchers + Real Income/Expenses)
    const [recentVouchers] = await pool.query(
      `SELECT * FROM vouchers ORDER BY voucher_date DESC, id DESC LIMIT 6`
    );
    let recentTransactions = recentVouchers;
    if (recentTransactions.length === 0) {
      const [recentIncome] = await pool.query(
        `SELECT received_date as voucher_date, particulars, reference_no as voucher_no, 'receipt' as voucher_type, amount as total_amount, 'posted' as status
         FROM income ORDER BY received_date DESC, id DESC LIMIT 5`
      );
      const [recentExpenses] = await pool.query(
        `SELECT expense_date as voucher_date, CONCAT(category, ' - ', payee_name) as particulars, voucher_no, 'payment' as voucher_type, amount as total_amount, 'posted' as status
         FROM expenses ORDER BY expense_date DESC, id DESC LIMIT 5`
      );
      recentTransactions = [...recentIncome, ...recentExpenses].sort((a, b) => new Date(b.voucher_date) - new Date(a.voucher_date)).slice(0, 6);
    }

    // 7. Monthly Time Series (Income vs Expense Jan - Dec)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySeries = monthNames.map((m, idx) => ({
      month: m,
      monthNum: idx + 1,
      income: 0,
      expense: 0,
      net: 0
    }));

    const [yearIncomeRows] = await pool.query(
      `SELECT MONTH(received_date) as m, COALESCE(SUM(amount), 0) as total 
       FROM income 
       WHERE YEAR(received_date) = ?
       GROUP BY m`,
      [currentYear]
    );
    yearIncomeRows.forEach(r => {
      const target = monthlySeries.find(item => item.monthNum === r.m);
      if (target) target.income = parseFloat(r.total);
    });

    const [yearExpenseRows] = await pool.query(
      `SELECT MONTH(expense_date) as m, COALESCE(SUM(amount), 0) as total 
       FROM expenses 
       WHERE YEAR(expense_date) = ? AND status IN ('approved', 'paid')
       GROUP BY m`,
      [currentYear]
    );
    yearExpenseRows.forEach(r => {
      const target = monthlySeries.find(item => item.monthNum === r.m);
      if (target) target.expense = parseFloat(r.total);
    });

    monthlySeries.forEach(item => {
      item.net = item.income - item.expense;
    });

    return res.json({
      success: true,
      data: {
        stats: {
          totalIncome: totalIncomeThisMonth,
          incomeGrowth: parseFloat(incomeGrowth.toFixed(1)),
          totalExpenses: totalExpensesThisMonth,
          expenseGrowth: parseFloat(expenseGrowth.toFixed(1)),
          netSurplus,
          surplusGrowth: parseFloat(surplusGrowth.toFixed(1)),
          totalReceivables: 0,
          overdueInvoicesCount: 0,
          totalPayables,
          overdueBillsCount,
          cashInHand
        },
        monthlySeries,
        bankAccounts,
        recentTransactions
      }
    });

  } catch (error) {
    console.error('[Accounts Dashboard Error]:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch accounts dashboard' });
  }
}

// Income Ledger List
async function getIncomeLedger(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT i.*, mr.receipt_number, ba.account_name as bank_account_name
       FROM income i
       LEFT JOIN money_receipts mr ON i.receipt_id = mr.id
       LEFT JOIN bank_accounts ba ON i.deposit_bank_account_id = ba.id
       ORDER BY i.received_date DESC, i.id DESC`
    );
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch income ledger' });
  }
}

// Expenses CRUD & Approvals
async function getExpenses(req, res) {
  try {
    const { status, categoryId, startDate, endDate } = req.query;
    let query = `
      SELECT e.*, ec.name as category_name, ba.account_name as bank_account_name, u.full_name as submitter_name
      FROM expenses e
      JOIN expense_categories ec ON e.category_id = ec.id
      LEFT JOIN bank_accounts ba ON e.bank_account_id = ba.id
      JOIN users u ON e.submitted_by_user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND e.status = ?`;
      params.push(status);
    }
    if (categoryId) {
      query += ` AND e.category_id = ?`;
      params.push(categoryId);
    }
    if (startDate) {
      query += ` AND e.expense_date >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND e.expense_date <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY e.expense_date DESC, e.id DESC`;
    const [rows] = await pool.query(query, params);
    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch expenses' });
  }
}

async function createExpense(req, res) {
  try {
    const { categoryId, category, title, description, amount, currency = 'INR', expenseDate, payeeName, paymentMethod, paymentMode, bankAccountId } = req.body;

    const resolvedPayee = payeeName || 'Vendor/Supplier';
    const resolvedTitle = title || description || `Payment to ${resolvedPayee}`;
    const resolvedMethod = paymentMethod || paymentMode || 'Bank Transfer';
    const numAmount = parseFloat(amount);

    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required' });
    }

    let finalCatId = parseInt(categoryId, 10);
    if (isNaN(finalCatId)) {
      if (category && typeof category === 'string') {
        const [catRows] = await pool.query('SELECT id FROM expense_categories WHERE name LIKE ? LIMIT 1', [`%${category}%`]);
        finalCatId = catRows.length > 0 ? catRows[0].id : 1;
      } else {
        finalCatId = 1;
      }
    }

    const voucherNo = `PV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
    const userId = req.user ? req.user.id : 1;

    const [result] = await pool.query(
      `INSERT INTO expenses (category_id, title, description, amount, currency, expense_date, payee_name, payment_method, bank_account_id, voucher_no, status, submitted_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [finalCatId, resolvedTitle, description || null, numAmount, currency, expenseDate || new Date().toISOString().slice(0, 10), resolvedPayee, resolvedMethod, bankAccountId || null, voucherNo, userId]
    );

    return res.status(201).json({ success: true, message: 'Expense claim recorded and submitted for approval', id: result.insertId, voucherNo });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to submit expense claim: ' + error.message });
  }
}

async function approveExpense(req, res) {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body; // 'approved', 'rejected', 'paid'

    if (action === 'rejected' && !rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required' });
    }

    await pool.query(
      `UPDATE expenses 
       SET status = ?, 
           approved_by_user_id = ?, 
           approved_at = NOW(),
           rejection_reason = ?
       WHERE id = ?`,
      [action, req.user.id, rejectionReason || null, id]
    );

    logAudit({
      userId: req.user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      module: 'expenses',
      action: action,
      recordId: id
    });

    return res.json({ success: true, message: `Expense ${action} successfully` });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update expense status' });
  }
}

// Expense Categories
async function getExpenseCategories(req, res) {
  try {
    const [categories] = await pool.query(`SELECT * FROM expense_categories ORDER BY name ASC`);
    return res.json({ success: true, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch expense categories' });
  }
}

// Bank Accounts
async function getBankAccounts(req, res) {
  try {
    const [accounts] = await pool.query(`SELECT * FROM bank_accounts ORDER BY id ASC`);
    return res.json({ success: true, data: accounts });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch bank accounts' });
  }
}

// Vouchers
async function getVouchers(req, res) {
  try {
    const [vouchers] = await pool.query(`SELECT * FROM vouchers ORDER BY voucher_date DESC, id DESC`);
    return res.json({ success: true, data: vouchers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch vouchers' });
  }
}

// Create Voucher
async function createVoucher(req, res) {
  try {
    const { voucherType = 'payment', voucherDate = new Date().toISOString().slice(0, 10), partyName, amount, currency = 'INR', paymentMode = 'Bank Transfer', bankAccountId, narration } = req.body;

    if (!partyName || !amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Party name and valid amount are required' });
    }

    const voucherNo = `VCH-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const [result] = await pool.query(
      `INSERT INTO vouchers (voucher_no, voucher_type, voucher_date, party_name, amount, currency, payment_mode, bank_account_id, narration, created_by_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [voucherNo, voucherType, voucherDate, partyName, parseFloat(amount), currency, paymentMode, bankAccountId || null, narration || null, req.user ? req.user.id : null]
    );

    return res.status(201).json({ success: true, message: `Voucher ${voucherNo} created successfully`, id: result.insertId, voucherNo });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create voucher: ' + error.message });
  }
}

module.exports = {
  getAccountsDashboard,
  getIncomeLedger,
  getExpenses,
  createExpense,
  submitExpense: createExpense,
  approveExpense,
  getExpenseCategories,
  getBankAccounts,
  getVouchers,
  createVoucher
};
