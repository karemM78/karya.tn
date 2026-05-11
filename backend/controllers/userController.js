const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const userService = require('../services/userService');
const userRepository = require('../repositories/userRepository');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await userService.authUser(email, password);

  if (user) {
    res.json({
      _id: user.ID,
      name: user.NAME,
      email: user.EMAIL,
      isAdmin: user.IS_ADMIN === 1,
      role: user.ROLE,
      avatar: user.AVATAR,
      token: generateToken(user.ID, user.ROLE, user.IS_ADMIN === 1, user.NAME, user.EMAIL),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  
  const user = await userService.registerUser({
    name,
    email,
    password,
    role: role || 'client'
  });

  if (user) {
    res.status(201).json({
      _id: user.ID,
      name: user.NAME,
      email: user.EMAIL,
      isAdmin: user.IS_ADMIN === 1,
      role: user.ROLE,
      token: generateToken(user.ID, user.ROLE, user.IS_ADMIN === 1, user.NAME, user.EMAIL),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserProfile(req.user._id);

  if (user) {
    res.json({
      _id: user.ID,
      name: user.NAME,
      email: user.EMAIL,
      isAdmin: user.IS_ADMIN === 1,
      role: user.ROLE,
      avatar: user.AVATAR,
      bio: user.BIO,
      location: user.LOCATION
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  console.log('Update Profile Request Body:', req.body);
  if (req.file) console.log('Update Profile Image:', req.file.path);

  const updateData = { ...req.body };

  if (req.file) {
    updateData.avatar = `/${req.file.path.replace(/\\/g, '/')}`;
  }

  const updatedUser = await userService.updateUserProfile(req.user._id, updateData);

  if (updatedUser) {
    res.json({
      _id: updatedUser.ID,
      name: updatedUser.NAME,
      email: updatedUser.EMAIL,
      isAdmin: updatedUser.IS_ADMIN === 1,
      avatar: updatedUser.AVATAR,
      bio: updatedUser.BIO,
      location: updatedUser.LOCATION,
      token: generateToken(updatedUser.ID, updatedUser.ROLE, updatedUser.IS_ADMIN === 1, updatedUser.NAME, updatedUser.EMAIL),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Forgot password
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await userRepository.findByEmail(req.body.email);

  if (!user) {
    return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expires = new Date(Date.now() + 15 * 60 * 1000);

  await userRepository.updatePasswordResetToken(user.ID, hashedToken, expires);

  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
      <p style="font-size: 16px; color: #555;">You requested a password reset. Please click the button below to set a new password. This link will expire in 15 minutes.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Reset Password</a>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      email: user.EMAIL,
      subject: 'Password Reset Request',
      html: message,
    });
    res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  } catch (error) {
    await userRepository.updatePasswordResetToken(user.ID, null, null);
    res.status(500);
    throw new Error('Email could not be sent.');
  }
});

// @desc    Reset password
// @route   POST /api/users/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await userRepository.findByResetToken(hashedToken);

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired token');
  }

  await userService.updateUserProfile(user.ID, {
    password: req.body.password,
    reset_password_token: null,
    reset_password_expires: null
  });

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
    token: generateToken(user.ID, user.ROLE, user.IS_ADMIN === 1, user.NAME, user.EMAIL),
  });
});

module.exports = {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
};
