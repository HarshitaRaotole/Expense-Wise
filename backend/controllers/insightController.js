const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

exports.getFinancialInsights = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { month } = req.query; 
    
    const realToday = new Date();
    let targetYear = realToday.getFullYear();
    let targetMonth = realToday.getMonth();
    let daysPassed = realToday.getDate();

    
    if (month) {
      const [y, m] = month.split('-');
      targetYear = parseInt(y);
      targetMonth = parseInt(m) - 1;
      
      
      if (targetYear !== realToday.getFullYear() || targetMonth !== realToday.getMonth()) {
        daysPassed = new Date(targetYear, targetMonth + 1, 0).getDate();
      }
    }
    
    const totalDaysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const currentMonthStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`;
    
    const startOfCurrentMonth = new Date(targetYear, targetMonth, 1);
    const startOfPastThreeMonths = new Date(targetYear, targetMonth - 3, 1);

    const allTransactions = await Transaction.find({
      user: userId, transactionType: 'expense', date: { $gte: startOfPastThreeMonths }
    }).populate('category', 'name');

    const currentMonthBudgets = await Budget.find({ user: userId, month: currentMonthStr }).populate('category', 'name');

    const currentMonthTxns = [];
    const pastThreeMonthsTxns = [];

    allTransactions.forEach(txn => {
      if (txn.date >= startOfCurrentMonth && txn.date <= new Date(targetYear, targetMonth + 1, 0, 23, 59, 59)) {
        currentMonthTxns.push(txn);
      } else if (txn.date < startOfCurrentMonth) {
        pastThreeMonthsTxns.push(txn);
      }
    });

    const currentMonthTotal = currentMonthTxns.reduce((sum, txn) => sum + txn.amount, 0);
    const predictedExpense = daysPassed > 0 ? (currentMonthTotal / daysPassed) * totalDaysInMonth : 0;

    const pastCategoryTotals = {};
    pastThreeMonthsTxns.forEach(txn => {
      const catName = txn.category?.name ? txn.category.name.toLowerCase() : 'uncategorized';
      pastCategoryTotals[catName] = (pastCategoryTotals[catName] || 0) + txn.amount;
    });

    const currentCategoryTotals = {};
    currentMonthTxns.forEach(txn => {
      const catName = txn.category?.name ? txn.category.name.toLowerCase() : 'uncategorized';
      currentCategoryTotals[catName] = (currentCategoryTotals[catName] || 0) + txn.amount;
    });

    const budgetExceededCategories = [];
    const historicalOverspentCategories = [];

    for (const [catName, currentAmount] of Object.entries(currentCategoryTotals)) {
      const userBudget = currentMonthBudgets.find(b => b.category?.name.toLowerCase() === catName);
      if (userBudget && currentAmount > userBudget.amount) {
        budgetExceededCategories.push(catName); 
      }

      const pastAverage = (pastCategoryTotals[catName] || 0) / 3;
      if (pastAverage > 0) {
        const threshold = pastAverage * 1.4; 
        if (currentAmount > threshold) {
          historicalOverspentCategories.push(catName); 
        }
      }
    }

    const alerts = [];
    if (budgetExceededCategories.length > 0) {
      alerts.push({
        type: 'BUDGET', title: 'Budget Limit Exceeded',
        message: `You exceeded your budget for: ${budgetExceededCategories.join(', ')}.`
      });
    }
    if (historicalOverspentCategories.length > 0) {
      alerts.push({
        type: 'HISTORICAL', title: 'Unusual Spending Detected',
        message: `You spent significantly more on ${historicalOverspentCategories.join(', ')} this month compared to your past average.`
      });
    }

    res.status(200).json({
      currentMonthTotal,
      predictedExpense: Math.round(predictedExpense),
      alerts
    });

  } catch (error) {
    console.error("Backend Crash:", error);
    res.status(500).json({ message: 'Server Error calculating insights' });
  }
};

// 2. GET AGGREGATED CHART DATA
exports.getChartData = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const { month } = req.query; // e.g., "2026-03"

    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr);
    const monthNum = parseInt(monthStr) - 1;

    // Date Boundaries
    const startOfMonth = new Date(year, monthNum, 1);
    const endOfMonth = new Date(year, monthNum + 1, 0, 23, 59, 59);
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);
    
    // Boundary for the last 12 months (For the Trend Chart)
    const startOfPast12Months = new Date(year, monthNum - 11, 1);

    // --- AGGREGATION 1: CATEGORY PIE CHART (Selected Month) ---
    const categorySpending = await Transaction.aggregate([
      { $match: { user: userId, transactionType: 'expense', date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: '$category', value: { $sum: '$amount' } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'catInfo' } },
      { $unwind: '$catInfo' },
      { $project: { name: '$catInfo.name', value: 1, _id: 0 } }
    ]);

    // --- AGGREGATION 2: BAR CHART (Current Year Income vs Expense) ---
    const yearlyStats = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: startOfYear, $lte: endOfYear } } },
      { $group: {
          _id: { month: { $month: "$date" }, type: "$transactionType" },
          total: { $sum: "$amount" }
      }}
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const barChartData = monthNames.map(m => ({ name: m, income: 0, expense: 0 }));

    yearlyStats.forEach(stat => {
      const monthIndex = stat._id.month - 1;
      if (stat._id.type === 'income') barChartData[monthIndex].income = stat.total;
      else barChartData[monthIndex].expense = stat.total;
    });

    // --- AGGREGATION 3: SUMMARY CARDS (Selected Month) ---
    const monthlyTotals = await Transaction.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: "$transactionType", total: { $sum: "$amount" } } }
    ]);

    let totalIncome = 0;
    let totalExpense = 0;
    monthlyTotals.forEach(t => {
      if (t._id === 'income') totalIncome = t.total;
      if (t._id === 'expense') totalExpense = t.total;
    });

    // --- AGGREGATION 4: 12-MONTH TREND LINE CHART ---
    const trendStats = await Transaction.aggregate([
      { $match: { user: userId, transactionType: 'expense', date: { $gte: startOfPast12Months, $lte: endOfMonth } } },
      { $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          total: { $sum: "$amount" }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } } // Sort oldest to newest
    ]);

    // Build array of last 12 months exactly (including empty months)
    const trendChartData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(year, monthNum - i, 1);
      trendChartData.push({ month: monthNames[d.getMonth()], year: d.getFullYear(), expense: 0 });
    }

    // Fill the array with aggregated data
    trendStats.forEach(stat => {
      const target = trendChartData.find(item => item.month === monthNames[stat._id.month - 1] && item.year === stat._id.year);
      if (target) target.expense = stat.total;
    });

    res.status(200).json({
      pieChartData: categorySpending,
      barChartData,
      trendChartData, 
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
      }
    });

  } catch (error) {
    console.error("Aggregation Error:", error);
    res.status(500).json({ message: "Error aggregating chart data" });
  }
};