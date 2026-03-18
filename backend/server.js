require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser()); 

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => console.log('Database connection failed:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/budgets', require('./routes/budgetRoutes'));
app.use('/api/insights', require('./routes/insightRoutes'));

// Basic route to test server
app.get('/', (req, res) => {
  res.send('Smart Expense Tracker API is running with HTTPOnly Cookies');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));