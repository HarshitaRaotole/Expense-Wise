const express = require('express');
const router = express.Router();
const { addTransaction, getTransactions, updateTransaction, deleteTransaction } = require('../controllers/transactionController');
const protect = require('../middleware/authMiddleware');
const { check } = require('express-validator');


router.use(protect); 

// Validation rules array
const transactionValidation = [
  check('amount', 'Amount must be a valid number').isNumeric(),
  check('categoryName', 'Category is required').not().isEmpty(),
  check('transactionType', 'Type must be income or expense').isIn(['income', 'expense'])
];

// Routes
router.post('/', transactionValidation, addTransaction); // Create
router.get('/', getTransactions);                        // Read
router.put('/:id', updateTransaction);                   // Update
router.delete('/:id', deleteTransaction);                // Delete

module.exports = router;