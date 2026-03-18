const express = require('express');

const router = express.Router();
const {setBudget, getBudgets, deleteBudget} = require('../controllers/budgetController');
const protect = require('../middleware/authMiddleware');


router.use(protect);
router.post('/',setBudget);//to create 
router.get('/',getBudgets);//to fetch
router.delete('/:id', deleteBudget);//to delete


module.exports = router


