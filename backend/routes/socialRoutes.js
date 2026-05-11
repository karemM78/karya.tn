const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const socialRepository = require('../repositories/socialRepository');
const userRepository = require('../repositories/userRepository');
const { protect } = require('../middleware/authMiddleware');

// @desc    Follow a user
// @route   POST /api/social/follow/:id
// @access  Private
router.post('/follow/:id', protect, asyncHandler(async (req, res) => {
  const success = await socialRepository.follow(req.user._id, req.params.id);
  if (success) {
    res.json({ message: 'User followed' });
  } else {
    res.status(400).json({ message: 'Already following or failed' });
  }
}));

// @desc    Unfollow a user
// @route   POST /api/social/unfollow/:id
// @access  Private
router.post('/unfollow/:id', protect, asyncHandler(async (req, res) => {
  const success = await socialRepository.unfollow(req.user._id, req.params.id);
  res.json({ message: 'User unfollowed' });
}));

// @desc    Get user followers and following counts
// @route   GET /api/social/stats/:id
// @access  Public
router.get('/stats/:id', asyncHandler(async (req, res) => {
  const stats = await socialRepository.getStats(req.params.id, req.user?._id);
  res.json(stats);
}));

// @desc    Like a property
// @route   POST /api/social/like/:id
// @access  Private
router.post('/like/:id', protect, asyncHandler(async (req, res) => {
  const likes = await socialRepository.toggleLike(req.user._id, req.params.id);
  res.json({ likes });
}));

// @desc    Rate an owner
// @route   POST /api/social/rate/:id
// @access  Private
router.post('/rate/:id', protect, asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const targetUser = await userRepository.findById(req.params.id);

  if (!targetUser || targetUser.ROLE !== 'owner') {
    res.status(404);
    throw new Error('Owner not found');
  }

  await socialRepository.addRating(req.user._id, req.params.id, rating, comment);
  res.status(201).json({ message: 'Rating added' });
}));

module.exports = router;
