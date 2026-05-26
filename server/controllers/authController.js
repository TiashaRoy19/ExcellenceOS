const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to generate JWT token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      res.status(400);
      return next(new Error('Please provide username, email and password'));
    }

    const userExists = await User.findByEmailOrUsername(email, username);
    if (userExists) {
      res.status(400);
      return next(new Error('User already exists with this email or username'));
    }

    const user = await User.create({
      username,
      email,
      password,
      streak: 1, // Start streak upon registration
      lastActive: new Date()
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        streak: user.streak,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      return next(new Error('Invalid user data'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400);
      return next(new Error('Please provide email and password'));
    }

    const user = await User.findByEmail(email);
    if (!user) {
      res.status(401);
      return next(new Error('Invalid credentials'));
    }

    const isMatch = await User.matchPassword(password, user.password);
    if (!isMatch) {
      res.status(401);
      return next(new Error('Invalid credentials'));
    }

    // Streak update logic
    const today = new Date();
    const lastActive = new Date(user.lastActive);
    
    // Reset hours, minutes, seconds, ms for calendar comparisons
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const lastActiveDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
    
    const diffTime = Math.abs(todayDate - lastActiveDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      user.streak += 1;
    } else if (diffDays > 1) {
      user.streak = 1; // reset streak if gap of more than 1 day
    }
    
    user.lastActive = today;
    const updatedUser = await User.updateActivity(user._id, {
      streak: user.streak,
      lastActive: user.lastActive,
    });

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      streak: updatedUser.streak,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      return next(new Error('User not found'));
    }
  } catch (error) {
    next(error);
  }
};
