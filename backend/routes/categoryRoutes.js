const express = require('express');
const router = express.Router();
const { getCategories, addCategory } = require('../controllers/categoryController');
const protect = require('../middleware/authMiddleware');

router.use(protect);
router.get('/', getCategories);
router.post('/', addCategory);

module.exports = router;