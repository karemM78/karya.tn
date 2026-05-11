const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const messageRepository = require('../repositories/messageRepository');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer Setup for Chat Media
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/chat/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `chat-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage });

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  const { recipientId, content, messageType, mediaUrl, propertyId } = req.body;

  const message = await messageRepository.create({
    sender: req.user._id,
    recipient: recipientId,
    content,
    messageType: messageType || 'text',
    mediaUrl,
    property: propertyId,
  });

  if (message) {
    res.status(201).json({
      _id: message.ID,
      sender: {
        _id: message.SENDER_ID,
        name: message.SENDER_NAME,
        avatar: message.SENDER_AVATAR
      },
      recipient: message.RECIPIENT_ID,
      content: message.CONTENT,
      messageType: message.MESSAGE_TYPE,
      mediaUrl: message.MEDIA_URL,
      createdAt: message.CREATED_AT
    });
  } else {
    res.status(400);
    throw new Error('Message could not be sent');
  }
}));

// @desc    Upload chat media
// @route   POST /api/messages/upload
// @access  Private
router.post('/upload', protect, upload.single('media'), (req, res) => {
  res.json(`/uploads/chat/${req.file.filename}`);
});

// @desc    Get user's inbox (list of chats)
// @route   GET /api/messages/inbox/all
// @access  Private
router.get('/inbox/all', protect, asyncHandler(async (req, res) => {
  const users = await messageRepository.getInbox(req.user._id);
  
  const formattedUsers = users.map(u => ({
    _id: u.ID,
    name: u.NAME,
    avatar: u.AVATAR,
    email: u.EMAIL
  }));

  res.json(formattedUsers);
}));

// @desc    Get unread messages count
// @route   GET /api/messages/unread/count
// @access  Private
router.get('/unread/count', protect, asyncHandler(async (req, res) => {
  const count = await messageRepository.getUnreadCount(req.user._id);
  res.json({ count });
}));

// @desc    Get conversation with a user
// @route   GET /api/messages/:userId
// @access  Private
router.get('/:userId', protect, asyncHandler(async (req, res) => {
  console.log(`Fetching conversation: Me (${req.user._id}) vs Them (${req.params.userId})`);
  const messages = await messageRepository.findConversation(req.user._id, req.params.userId);
  console.log(`Found ${messages.length} messages`);

  const formattedMessages = messages.map(m => ({
    _id: m.ID,
    sender: { _id: m.SENDER_ID, name: m.SENDER_NAME, avatar: m.SENDER_AVATAR },
    recipient: m.RECIPIENT_ID,
    content: m.CONTENT,
    messageType: m.MESSAGE_TYPE,
    mediaUrl: m.MEDIA_URL,
    property: m.PROPERTY_ID ? {
      _id: m.PROPERTY_ID,
      title: m.PROP_TITLE,
      price: m.PROP_PRICE
    } : null,
    createdAt: m.CREATED_AT
  }));

  res.json(formattedMessages);
}));

module.exports = router;
