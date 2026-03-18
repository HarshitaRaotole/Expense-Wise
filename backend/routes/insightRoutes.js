const express = require('express');
const router = express.Router();
const { getFinancialInsights , getChartData} = require('../controllers/insightController');
const protect = require('../middleware/authMiddleware');

// Secure the route
router.use(protect);

// Define the GET route
router.get('/', getFinancialInsights);
router.get('/charts', getChartData);

module.exports = router;