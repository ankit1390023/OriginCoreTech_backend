const jwt = require('jsonwebtoken');
const { User, UserDetail } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const otpController = require('./otpController');

exports.registerUser = async (req, res) => {
  const { firstName, lastName, email, phone, password, userRole } = req.body;
  console.log(firstName, lastName, email, phone, password, userRole);
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

    // Create a basic UserDetail record for email verification
    await UserDetail.create({
      userId: user.id,
      firstName,
      lastName,
      email,
      phone,
      dob: '1900-01-01', // Default date for required field
      gender: 'Not Specified', // Default value for required field
      userType: 'Not Specified', // Default value for required field
      isEmailVerified: false,
      isPhoneVerified: false,
      isGstVerified: false,
      termsAndCondition: false
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
    const isPasswordValid = bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    //  Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.userRole },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
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
}

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
  const { oldPassword, newPassword } = req.body;


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
    console.log({ oldPassword })
    console.log(user.password)
    const isMatch = bcrypt.compare(oldPassword, user.password)

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

// Forgot Password - send OTP to email
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Call otpController.sendOtp to send OTP email
    // We simulate calling sendOtp function here by invoking it directly
    // Since sendOtp expects req and res, we create mock objects

    const mockReq = { body: { email } };
    const mockRes = {
      status: (code) => ({
        json: (obj) => ({ code, obj }),
      }),
      json: (obj) => ({ code: 200, obj }),
    };

    await otpController.sendOtp(mockReq, mockRes);

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Utility function to verify OTP without HTTP response
const verifyOtpUtility = async (email, otp) => {
  const otpStore = require('../utils/otpStore');
  const { User, UserDetail } = require('../models');

  const record = otpStore[email];

  if (!record) {
    throw new Error('No OTP found for this email');
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    throw new Error('OTP expired');
  }

  if (record.otp !== otp) {
    throw new Error('Invalid OTP');
  }

  delete otpStore[email];

  // Find user by email
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('User not found');
  }

  // Find user detail by userId
  let userDetail = await UserDetail.findOne({ where: { userId: user.id } });

  // If UserDetail doesn't exist, create a basic one
  if (!userDetail) {
    userDetail = await UserDetail.create({
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      dob: '1900-01-01', // Default date for required field
      gender: 'Not Specified', // Default value for required field
      userType: 'Not Specified', // Default value for required field
      isEmailVerified: false,
      isPhoneVerified: false,
      isGstVerified: false,
      termsAndCondition: false
    });
  }

  // Update email verification status
  userDetail.isEmailVerified = true;
  await userDetail.save();

  return {
    message: 'OTP verified successfully',
    emailVerified: true,
    userRole: user.userRole
  };
};

// Reset Password with OTP verification
exports.resetPasswordWithOtp = async (req, res) => {
  // console.log("hi  bro i am here")
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP and new password are required' });
  }
  // console.log(req.body)
  try {
    // Verify OTP using utility function
    await verifyOtpUtility(email, otp);

    // OTP verified, update password
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    if (error.message.includes('OTP') || error.message.includes('User not found')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
