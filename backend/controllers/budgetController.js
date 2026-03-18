const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

exports.setBudget = async (req, res) => {
  try {
    const { categoryId, amount, month } = req.body; // month format: "YYYY-MM"

    // Upsert: If budget exists for this category/month, update it. If not, create it.
    const budget = await Budget.findOneAndUpdate(
      { user: req.user.userId, category: categoryId, month },
      { amount },
      { new: true, upsert: true }
    ).populate('category', 'name');

    res.status(200).json({ message: 'Budget set successfully', budget });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBudgets = async (req, res) => {
  try {
    const { month } = req.query; // e.g., "2023-10"
    
    // 1. Find all budgets for this month
    const budgets = await Budget.find({ user: req.user.userId, month }).populate('category', 'name');

    // 2. Calculate progress for each budget
    const budgetProgress = await Promise.all(budgets.map(async (budget) => {
      // Find all expenses for this user, category, and month
      const startDate = new Date(`${month}-01`);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0); // Last day of month

      const transactions = await Transaction.find({
        user: req.user.userId,
        category: budget.category._id,
        transactionType: 'expense',
        date: { $gte: startDate, $lte: endDate }
      });
      // Sum the expenses
      const spent = transactions.reduce((acc, curr) => acc + curr.amount, 0);

      return {
        _id: budget._id,
        category: budget.category,
        budgetAmount: budget.amount,
        spentAmount: spent,
        remainingAmount: budget.amount - spent,
      };
    }));

    res.status(200).json(budgetProgress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 3. DELETE BUDGET API
exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the budget by ID and ensure it belongs to the logged-in user
    const budget = await Budget.findOneAndDelete({ _id: id, user: req.user.userId });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found or unauthorized' });
    }

    res.status(200).json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};