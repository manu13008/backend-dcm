const mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
const Notification = require('../models/notification');
const { authenticateToken } = require('../modules/authentication')



// router.post('/notifications', authenticateToken, async (req, res) => {
//     try {
//       const notifications = await Notification.find({ userId: req.body.userId, isRead: false });
//       res.status(200).json(notifications);
//     } catch (error) {
//       res.status(500).json({ error: 'Server error' });
//     }
//   });

  module.exports = router;