const { User, UserDetail } = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../jwtConfig');
const bcrypt = require('bcrypt');

exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, phone, password, userRole } = req.body;

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    const user = await User.create({ firstName, lastName, email, password, userRole });
    res.status(201).json({ message: 'User registered', user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    // Generating JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.userRole },
      config.jwtSecret,
      { expiresIn: config.jwtExpiry }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, role: user.userRole }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getUserDetailsByEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({
      where: { email },
      include: [{ model: UserDetail }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User details fetched successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone:user.phone,
      }
    });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


 
  
  
