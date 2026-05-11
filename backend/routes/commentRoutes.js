const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const commentRepository = require('../repositories/commentRepository');
const { protect } = require('../middleware/authMiddleware');

// @desc    Add a comment/rating to a property
// @route   POST /api/comments
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  const { propertyId, text, rating } = req.body;

  const comment = await commentRepository.create({
    user: req.user._id,
    property: propertyId,
    text,
    rating,
  });

  if (comment) {
    res.status(201).json({
      _id: comment.ID,
      user: {
        _id: comment.RATER_ID,
        name: comment.NAME,
        avatar: comment.AVATAR
      },
      text: comment.USER_COMMENT,
      rating: comment.RATING,
      createdAt: comment.CREATED_AT
    });
  } else {
    res.status(400);
    throw new Error('Failed to create comment');
  }
}));

// @desc    Get comments for a property
// @route   GET /api/comments/:propertyId
// @access  Public
router.get('/:propertyId', asyncHandler(async (req, res) => {
  const comments = await commentRepository.findByProperty(req.params.propertyId);

  const formattedComments = comments.map(c => ({
    _id: c.ID,
    user: {
      _id: c.RATER_ID,
      name: c.NAME,
      avatar: c.AVATAR
    },
    text: c.USER_COMMENT,
    rating: c.RATING,
    createdAt: c.CREATED_AT
  }));

  res.json(formattedComments);
}));

module.exports = router;
