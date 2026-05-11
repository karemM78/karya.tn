const Message = require('../models/Message');
const User = require('../models/User');

class MessageRepository {
  async create(messageData) {
    const message = await Message.create({
      sender: messageData.sender,
      recipient: messageData.recipient,
      content: messageData.content,
      messageType: messageData.messageType || 'text',
      mediaUrl: messageData.mediaUrl,
      property: messageData.property,
    });

    return this.findById(message._id);
  }

  async findById(id) {
    const message = await Message.findById(id).populate('sender', 'name avatar');
    return message ? this._mapMessage(message) : null;
  }

  async findConversation(user1, user2) {
    // Mark messages as read
    await Message.updateMany(
      { sender: user2, recipient: user1, isRead: false },
      { $set: { isRead: true } }
    );

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    })
      .populate('sender', 'name avatar')
      .populate('property', 'title price')
      .sort({ createdAt: 1 });

    return messages.map(m => this._mapMessage(m));
  }

  async getInbox(userId) {
    const messages = await Message.find({
      $or: [{ sender: userId }, { recipient: userId }],
    });

    const contactIds = new Set();
    messages.forEach(m => {
      if (m.sender.toString() !== userId.toString()) contactIds.add(m.sender.toString());
      if (m.recipient.toString() !== userId.toString()) contactIds.add(m.recipient.toString());
    });

    const contacts = await User.find({ _id: { $in: Array.from(contactIds) } }, 'name avatar email');
    return contacts.map(c => ({
      ID: c._id.toString(),
      NAME: c.name,
      AVATAR: c.avatar,
      EMAIL: c.email,
    }));
  }

  async getUnreadCount(userId) {
    const count = await Message.countDocuments({ recipient: userId, isRead: false });
    return count;
  }

  _mapMessage(message) {
    const mObj = message.toObject();
    return {
      ID: mObj._id.toString(),
      SENDER_ID: mObj.sender?._id?.toString() || mObj.sender?.toString(),
      RECIPIENT_ID: mObj.recipient?._id?.toString() || mObj.recipient?.toString(),
      CONTENT: mObj.content,
      MESSAGE_TYPE: mObj.messageType,
      MEDIA_URL: mObj.mediaUrl,
      PROPERTY_ID: mObj.property?._id?.toString() || mObj.property?.toString(),
      IS_READ: mObj.isRead ? 1 : 0,
      CREATED_AT: mObj.createdAt,
      SENDER_NAME: mObj.sender?.name,
      SENDER_AVATAR: mObj.sender?.avatar,
      PROP_TITLE: mObj.property?.title,
      PROP_PRICE: mObj.property?.price,
    };
  }
}

module.exports = new MessageRepository();
