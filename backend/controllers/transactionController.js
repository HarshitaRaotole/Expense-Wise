const Transaction = require('../models/Transaction');
const Category = require('../models/Category');
const Budget = require('../models/Budget'); // NEW
const emailService = require('../services/emailService'); // NEW
const { validationResult } = require('express-validator');


const emailThrottleCache = {}; 
const THREE_HOURS = 3 * 60 * 60 * 1000; 


const checkAlertsAndSendEmails = async (userId, userEmail, categoryId, categoryName) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const startOfPastThreeMonths = new Date(currentYear, currentMonth - 3, 1);

    // 1. Fetch all expenses for THIS SPECIFIC CATEGORY in the last 3 months
    const allCategoryTxns = await Transaction.find({
      user: userId,
      category: categoryId,
      transactionType: 'expense',
      date: { $gte: startOfPastThreeMonths }
    });

    let currentMonthSpent = 0;
    let pastThreeMonthsSpent = 0;

    allCategoryTxns.forEach(txn => {
      if (txn.date >= startOfCurrentMonth) currentMonthSpent += txn.amount;
      else pastThreeMonthsSpent += txn.amount;
    });

    const pastAverage = pastThreeMonthsSpent / 3;

    // 2. Fetch Budget for this category
    const userBudget = await Budget.findOne({ user: userId, category: categoryId, month: currentMonthStr });

    //  BUDGET EXCEEDED 
    if (userBudget && currentMonthSpent > userBudget.amount) {
      const cacheKey = `BUDGET-${userEmail}-${categoryName}`;
      if (!emailThrottleCache[cacheKey] || (Date.now() - emailThrottleCache[cacheKey]) > THREE_HOURS) {
        
        // Send Email
        emailService.sendBudgetExceededEmail(userEmail, categoryName, currentMonthSpent, userBudget.amount);
        emailThrottleCache[cacheKey] = Date.now(); // Start 3 hour timer
        console.log(`🚨 Budget Email sent for ${categoryName}`);
      }
    }

    //  HISTORICAL OVERSPENDING (40% MORE) 
    if (pastAverage > 0) {
      const threshold = pastAverage * 1.4;
      if (currentMonthSpent > threshold) {
        const cacheKey = `HISTORICAL-${userEmail}-${categoryName}`;
        if (!emailThrottleCache[cacheKey] || (Date.now() - emailThrottleCache[cacheKey]) > THREE_HOURS) {
          
          // Send Email
          emailService.sendOverspendingEmail(userEmail, categoryName, currentMonthSpent, Math.round(threshold));
          emailThrottleCache[cacheKey] = Date.now(); // Start 3 hour timer
          console.log(`📈 Historical Overspending Email sent for ${categoryName}`);
        }
      }
    }

  } catch (error) {
    console.error("Error in background alert checker:", error);
  }
};


// 1. Add Transaction
exports.addTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { amount, description, categoryName, transactionType, date } = req.body;
    const userId = req.user.userId;
    const userEmail = req.user.email; 

    // Find or Create Category
    let category = await Category.findOne({ 
      name: new RegExp(`^${categoryName}$`, 'i'), 
      $or: [{ user: userId }, { user: null }] 
    });

    if (!category) {
      category = new Category({ name: categoryName, user: userId });
      await category.save();
    }

    const transaction = new Transaction({
      user: userId, amount, description, category: category._id, transactionType, date: date || Date.now()
    });

    await transaction.save();

    // Send successful response to frontend IMMEDIATELY
    res.status(201).json({ message: "Transaction added successfully", transaction });

    
    // This allows the frontend to get success instantly, while the server checks math in the background.
    if (transactionType === 'expense' && userEmail) {
      checkAlertsAndSendEmails(userId, userEmail, category._id, category.name);
    }

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.userId }).populate("category", "name").sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) { res.status(500).json({ message: "Server error", error: error.message }); }
};

exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    if (transaction.user.toString() !== req.user.userId) return res.status(401).json({ message: "Not authorized" });

    transaction.amount = req.body.amount || transaction.amount;
    transaction.description = req.body.description || transaction.description;
    transaction.transactionType = req.body.transactionType || transaction.transactionType;
    transaction.date = req.body.date || transaction.date;

    await transaction.save();
    res.status(200).json({ message: "Transaction updated", transaction });
  } catch (error) { res.status(500).json({ message: "Server error" }); }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });
    if (transaction.user.toString() !== req.user.userId) return res.status(401).json({ message: "Not authorized" });

    await transaction.deleteOne();
    res.status(200).json({ message: "Transaction deleted" });
  } catch (error) { res.status(500).json({ message: "Server error" }); }
};