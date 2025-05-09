const { User, UserDetail } = require('../models'); 
const jwt = require('jsonwebtoken');
const config = require('../jwtConfig');
const bcrypt = require('bcrypt');

exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, phone, password, userRole } = req.body;

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    // Validate if the user role is 'COMPANY' and check the email domain
    if (userRole === 'COMPANY') {
      const emailDomain = email.split('@')[1];
      const allowedDomains = ['.com', '.org', '.net', '.co', '.io', '.tech', '.in'];

      // Check if the email domain ends with one of the allowed domains
      const isValidDomain = allowedDomains.some(domain => emailDomain.endsWith(domain));

      if (!isValidDomain) {
        return res.status(400).json({ message: 'Please provide a professional email address for the company role.' });
      }
    }

    // Encrypt password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ 
      firstName, 
      lastName, 
      email, 
      phone, 
      password: hashedPassword, 
      userRole 
    });

    res.status(201).json({ message: 'User registered', user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.loginUser = async (req, res) => {
  let { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    console.log('User found:', user);
    if (!user) return res.status(404).json({ message: 'User not found' });

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
        phone: user.phone,
      }
    });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
