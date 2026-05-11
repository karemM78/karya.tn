const Notification = require('../models/Notification');

class NotificationRepository {
  async findByRecipient(recipientId) {
    const notifications = await Notification.find({ recipient: recipientId })
      .populate('sender', 'name avatar')
      .populate('property', 'title')
      .sort({ createdAt: -1 });

    return notifications.map(n => this._mapNotification(n));
  }

  async markAsRead(id) {
    await Notification.findByIdAndUpdate(id, { isRead: true });
  }

  async markAllAsRead(recipientId) {
    await Notification.updateMany({ recipient: recipientId }, { isRead: true });
  }

  async create(data) {
    await Notification.create({
      recipient: data.recipient,
      sender: data.sender,
      property: data.property,
      notifType: data.type || 'info',
      message: data.message,
    });
  }

  _mapNotification(notification) {
    const nObj = notification.toObject();
    return {
      ID: nObj._id.toString(),
      RECIPIENT_ID: nObj.recipient?._id?.toString() || nObj.recipient?.toString(),
      SENDER_ID: nObj.sender?._id?.toString() || nObj.sender?.toString(),
      PROPERTY_ID: nObj.property?._id?.toString() || nObj.property?.toString(),
      NOTIF_TYPE: nObj.notifType,
      MESSAGE: nObj.message,
      IS_READ: nObj.isRead ? 1 : 0,
      CREATED_AT: nObj.createdAt,
      SENDER_NAME: nObj.sender?.name,
      SENDER_AVATAR: nObj.sender?.avatar,
      PROP_TITLE: nObj.property?.title,
    };
  }
}

module.exports = new NotificationRepository();
