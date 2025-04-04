const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// exports.createAdmin = async (req, res) => {
//   try {
//     const { password } = req.body;
    
//     // Delete existing admin if any
//     await User.deleteOne({ email: "admin@keymaster.com" });

//     // Create new admin
//     const admin = await User.create({
//       email: "admin@keymaster.com",
//       password: password,
//       role: "admin"
//     });

//     res.status(201).json(admin);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };
// User Registration
exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Prevent user role registration via this endpoint
    if (await User.findOne({ email })) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Only allow admin creation through specific email
    const role = email === 'admin@keymaster.com' ? 'admin' : 'issuer';
    
    // Create new user
    const newUser = await User.create({
      email,
      password,
      role
    });

    // Generate JWT
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      status: 'success',
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// User Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    
    if (!user|| !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Only issue tokens to admin/issuer
    if (!['admin', 'issuer'].includes(user.role)) {
      return res.status(403).json({ 
        error: 'System access requires admin/issuer privileges' 
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    // console.log('Authorization header:', req.headers.authorization);
    // console.log('Received token:', req.headers.authorization?.split(' ')[1]);
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in MongoDB
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ error: 'User not found' });

    // Return user data
    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Full error:', error);
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};