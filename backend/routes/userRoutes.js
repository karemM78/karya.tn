const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const userRepository = require('../repositories/userRepository');
const generateToken = require('../utils/generateToken');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const rateLimit = require('express-rate-limit');
const { OAuth2Client } = require('google-auth-library');
const {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
} = require('../controllers/userController');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Upload user avatar
// @route   POST /api/users/upload-avatar
// @access  Private
router.post('/upload-avatar', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image');
  }
  res.send(`/${req.file.path.replace(/\\/g, '/')}`);
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
router.post('/login', authUser);

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
router.post('/', registerUser);

// @desc    Forgot password
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per hour
  message: { message: 'Too many password reset requests from this IP, please try again after an hour' },
});
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);

// @desc    Reset password
// @route   POST /api/users/reset-password/:token
// @access  Public
router.post('/reset-password/:token', resetPassword);

// @desc    Google Auth login
// @route   POST /api/users/google
// @access  Public
router.post('/google', asyncHandler(async (req, res) => {
  const { tokenId } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture, sub: googleId } = ticket.getPayload();

    let user = await userRepository.findByEmail(email);

    if (!user) {
      user = await userRepository.create({
        name,
        email,
        googleId,
        avatar: picture,
      });
    } else if (!user.GOOGLE_ID) {
      user = await userRepository.update(user.ID, {
        googleId,
        avatar: picture,
      });
    }

    res.json({
      _id: user.ID,
      name: user.NAME,
      email: user.EMAIL,
      isAdmin: user.IS_ADMIN === 1,
      role: user.ROLE,
      avatar: user.AVATAR,
      token: generateToken(user.ID, user.ROLE, user.IS_ADMIN === 1, user.NAME, user.EMAIL),
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
}));

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, getUserProfile);

// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, upload.single('image'), updateUserProfile);

// @desc    Get public user by ID
// @route   GET /api/users/public/:id
// @access  Public
router.get('/public/:id', asyncHandler(async (req, res) => {
  const user = await userRepository.findById(req.params.id);
  const socialRepository = require('../repositories/socialRepository');

  if (user) {
    const followers = await socialRepository.getFollowers(req.params.id);
    res.json({
      _id: user.ID,
      name: user.NAME,
      avatar: user.AVATAR,
      bio: user.BIO,
      location: user.LOCATION,
      role: user.ROLE,
      rating: user.RATING,
      numReviews: user.NUM_REVIEWS,
      followers: followers
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
}));

module.exports = router;
