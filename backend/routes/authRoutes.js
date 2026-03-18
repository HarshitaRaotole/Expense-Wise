const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  refreshAccessToken, 
  logout, 
  verifyEmail
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail); 
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logout);

module.exports = router;