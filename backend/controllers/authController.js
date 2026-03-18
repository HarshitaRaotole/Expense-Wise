const axios = require("axios");

const User = require('../models/User');
const Category = require('../models/Category');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1. REGISTER API 
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const registrationToken = jwt.sign(
      { name, email, password: hashedPassword },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log("SENDER_EMAIL:", process.env.SENDER_EMAIL);
    console.log("BREVO_API_KEY:", process.env.BREVO_API_KEY ? "Loaded" : "Missing");

    const verificationUrl = `https://expense-wise-theta.vercel.app/verify-email/${registrationToken}`;

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "ExpenseWise",
          email: process.env.SENDER_EMAIL,
        },
        to: [
          {
            email: email,
          },
        ],
        subject: "Complete your ExpenseWise Registration",
        htmlContent: `
          <h2>Activate Your Account</h2>
          <p>Hi ${name},</p>
          <a href="${verificationUrl}">Verify Account</a>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          "accept": "application/json",
        },
      }
    );

    console.log("Verification email sent");

    res.status(200).json({ message: 'Verification link sent! Check your email to create your account.' });

  } catch (error) {
    console.error("REGISTER ERROR:", error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to process registration', error: error.message });
  }
};

// 2. VERIFY EMAIL API
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired verification link.' });
    }

    const existingUser = await User.findOne({ email: decoded.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Account already verified and created. Please login.' });
    }

    const newUser = new User({
      name: decoded.name,
      email: decoded.email,
      password: decoded.password,
      isVerified: true
    });

    await newUser.save();

    const defaultCategories = [
      { name: 'Food', icon: '🍔', type: 'expense', user: newUser._id },
      { name: 'Transport', icon: '🚗', type: 'expense', user: newUser._id },
      { name: 'Shopping', icon: '🛍️', type: 'expense', user: newUser._id },
      { name: 'Bills', icon: '📄', type: 'expense', user: newUser._id },
      { name: 'Entertainment', icon: '🎬', type: 'expense', user: newUser._id },
      { name: 'Health', icon: '🏥', type: 'expense', user: newUser._id },
    ];

    await Category.insertMany(defaultCategories);

    const accessToken = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'Email verified and account created successfully!',
      user: { id: newUser._id, name: newUser.name, email: newUser.email }
    });

  } catch (error) {
    console.error("VERIFY ERROR:", error);
    res.status(500).json({ message: 'Account creation failed', error: error.message });
  }
};

// 3. LOGIN API
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first.' });
    }

    const accessToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: 'Login successful',
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 4. REFRESH TOKEN API
exports.refreshAccessToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token' });
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000
    });

    res.status(200).json({ message: 'Refreshed' });
  });
};

// 5. LOGOUT API
exports.logout = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
};