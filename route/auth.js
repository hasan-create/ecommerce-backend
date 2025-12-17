const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const router = express.Router();
const User = require('./user');

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hash,
    });

    await newUser.save();
    console.log("✅ User saved successfully");
    res.status(200).json({ message: 'Signup successful' });

  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

//  Login route
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toString();
    password = password.toString();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Username or password incorrect' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Username or password incorrect' });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, 
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    console.log('✅ Token issued:', token);
    res.status(200).json({ message: 'Login successful', email: user.email });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});


router.post('/logout', async (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      sameSite: 'lax',
      path: '/',
    });
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// ✅ Verify user (fetch logged-in user info)
router.get('/me', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email }).select('username email');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    console.error('❌ Auth check error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;

