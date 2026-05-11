const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const notificationRepository = require('../repositories/notificationRepository');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const notifications = await notificationRepository.findByRecipient(req.user._id);
  
  const formatted = notifications.map(n => ({
    _id: n.ID,
    sender: n.SENDER_ID ? { _id: n.SENDER_ID, name: n.SENDER_NAME, avatar: n.SENDER_AVATAR } : null,
    property: n.PROPERTY_ID ? { _id: n.PROPERTY_ID, title: n.PROP_TITLE } : null,
    type: n.NOTIF_TYPE,
    message: n.MESSAGE,
    read: n.IS_READ === 1,
    createdAt: n.CREATED_AT
  }));

  res.json(formatted);
}));

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, asyncHandler(async (req, res) => {
  await notificationRepository.markAsRead(req.params.id);
  res.json({ message: 'Notification marked as read' });
}));

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', protect, asyncHandler(async (req, res) => {
  await notificationRepository.markAllAsRead(req.user._id);
  res.json({ message: 'All notifications marked as read' });
}));

module.exports = router;
