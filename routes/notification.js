const mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
const Notification = require('../models/notification');
const { authenticateToken } = require('../modules/authentication')



router.get('/all/:userId', async (req, res) => {
  let userId = req.params.userId;
  if (userId) {
    Notification.find({ userId: userId, isRead: false })
    .populate('_dcm')
    .then(notifications => {
    
      res.status(200).json({result : true, notifications });

    })
    

  } else {
    res.status(500).json( {result : false , error: 'Server error' });
  } 
    }
  );

  module.exports = router;