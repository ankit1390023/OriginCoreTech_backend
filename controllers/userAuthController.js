const { User, UserDetail } = require('../models'); 
const jwt = require('jsonwebtoken');
const config = require('../jwtConfig');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, phone, password, userRole } = req.body;

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    if (userRole === 'COMPANY') {
      const emailDomain = email.split('@')[1];
      const allowedDomains = ['.com', '.org', '.net', '.co', '.io', '.tech', '.in'];

      const isValidDomain = allowedDomains.some(domain => emailDomain.endsWith(domain));

      if (!isValidDomain) {
        return res.status(400).json({ message: 'Please provide a professional email address for the company role.' });
      }
    }

    // Encrypt password before saving
    

    const user = await User.create({ 
      firstName, 
      lastName, 
      email, 
      phone, 
      password: password, 
      userRole 
    });

    res.status(201).json({ message: 'User registered', user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    console.log('User found:', user);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    //  Compare password with hashed password in DB
    const isPasswordValid =  bcrypt.compare(password,user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    //  Generate JWT token
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
  }}

// get user 
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

// Change Email API
exports.changeEmail = async (req, res) => {
  const { userId, newEmail } = req.body;

  if (!userId || !newEmail) {
    return res.status(400).json({ message: 'User ID and new email are required.' });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: 'User not found or account deleted.' });
    }

    if (user.email === newEmail) {
      return res.status(400).json({ message: 'New email is the same as the current email.' });
    }

    const emailExists = await User.findOne({ where: { email: newEmail, id: { [Op.ne]: userId } } });
    if (emailExists) {
      return res.status(409).json({ message: 'Email is already in use by another user.' });
    }

    user.email = newEmail;
    await user.save();

    res.status(200).json({ message: 'Email updated successfully.', email: newEmail });
  } catch (error) {
    console.error('Change email error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Change Password API
exports.changePassword = async (req, res) => {
  const {oldPassword, newPassword } = req.body;
  

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'User ID, old password, and new password are required.' });
  }
  const userId = req.user.id
  console.log(req.body);
  console.log(req.user)
  try {
    const user = await User.findByPk(userId);
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: 'User not found or account deleted.' });
    }
    console.log({oldPassword})
    console.log(user.password)
    const isMatch = bcrypt.compare(oldPassword,user.password)
   
    if (!isMatch) {
      return res.status(401).json({ message: 'Old password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Soft Delete Account API
exports.softDeleteAccount = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: 'User not found or already deleted.' });
    }

    user.isDeleted = true;
    await user.save();

    res.status(200).json({ message: 'Account soft deleted successfully.' });
  } catch (error) {
    console.error('Soft delete error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
