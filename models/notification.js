const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  _dcm : { type: mongoose.Schema.Types.ObjectId, ref: 'dcm', required: true},
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const notification = mongoose.model('notification', notificationSchema);

module.exports = notification;