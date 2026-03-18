const User = require('../models/User');
const Category = require('../models/Category');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// 1. REGISTER API 
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation: Check if email is already in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash the password 
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a temporary token containing user info (expires in 24h)
    // This holds the data until they click verify
    const registrationToken = jwt.sign(
      { name, email, password: hashedPassword },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail', 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationUrl = `http://localhost:3000/verify-email/${registrationToken}`;
    
    const mailOptions = {
      from: `"ExpenseWise" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Complete your ExpenseWise Registration',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 12px;">
          <h2 style="color: #3b82f6; text-align: center;">Activate Your Account</h2>
          <p>Hi ${name},</p>
          <p>Thank you for choosing ExpenseWise! To complete your registration and create your account, please click the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 14px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify & Create Account</a>
          </div>
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">This link will expire in 24 hours. If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    // Notice: We haven't called User.save() yet!
    res.status(200).json({ message: 'Verification link sent! Check your email to create your account.' });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: 'Failed to process registration', error: error.message });
  }
};

// 2. VERIFY EMAIL API
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Decode and verify the token
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

    // AUTO-LOGIN: Generate Session Tokens
    const accessToken = jwt.sign({ userId: newUser._id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: newUser._id, email: newUser.email }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

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
    
    
    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email first.' });

    const accessToken = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.cookie('accessToken', accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.status(200).json({ message: 'Login successful', user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// 4. REFRESH TOKEN API
exports.refreshAccessToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    const newAccessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.cookie('accessToken', newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 15 * 60 * 1000 });
    res.status(200).json({ message: 'Refreshed' });
  });
};

// 5. LOGOUT API
exports.logout = (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
};