const mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
const Notification = require('../models/notification');
const { authenticateToken } = require('../modules/authentication')




router.get('/all/:userId', async (req, res) => {
  let userId = req.params.userId;
  if (userId) {
    Notification.find({ userId: userId })
    .populate('_dcm')
    .then(notifications => {
      const sortedNotifications = notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.status(200).json({result : true, notifications : sortedNotifications });

    })
    

  } else {
    res.status(500).json( {result : false , error: 'Server error' });
  } 
    }
  );



  // Notification.aggregate([
  //   {
  //     $match: { userId:  new mongoose.Types.ObjectId(req.params.userId) } // Filtrer les documents où isRead est false (non lues)
  //   },

  //   {
  //     $lookup: {
  //       from: "dcms", // Le nom de la collection que vous souhaitez peupler
  //       localField: "_dcm", // Le champ local dans la collection Notification qui fait référence à la collection DCM
  //       foreignField: "_id", // Le champ dans la collection DCM à utiliser pour la correspondance
  //       as: "dcm" // Le nom de la clé dans le résultat où les données peuplées seront stockées
  //     }
  //   },
  //   {
  //     $unwind: '$dcm' // Décompose le tableau dcm pour que chaque document soit une notification avec un seul document DCM
  //   },
  //   {
  //     $project: {
  //       _id: 1,
  //       userId: 1,
  //       message: 1,
  //       isRead: 1,
  //       date: 1,
  //       _id: 1,
  //       author: 1,
  //       content: 1,
  //       subCategory: 1,
  //       origins: 1,
  //       target: 1,
  //       likes: 1,
  //       dislikes: 1,
  //       date: 1,
  //       type: 1,
  //       isAnonym: 1,
  //       mod_isSensitiveContent: 1,
  //       mod_isCensored: 1,
  //       mod_flags: 1
  //     }
  //   }
  // ])
  // .then(notifications => {
  //   res.status(200).json({ result: true, notifications });
  // })
  // .catch(error => {
  //   res.status(500).json({ result: false, error: error.message });
  // });

// }})




//Route qui marque les notifications unread comme read. Route appelée quand je vais sur l'onglet notifications
router.put('/all/:userId', async (req, res) => {
  
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ result: false, error: 'Missing userId parameter' });
    }

    const updateResult = await Notification.updateMany(
      { userId: userId, isRead: false }, // Critère de recherche
      { $set: { isRead: true } } // Modification à appliquer
    );

    if (updateResult) {
      return res.status(200).json({ result: true, notifications : updateResult, message: 'Notifications updated successfully' });
    } else {
      return res.status(404).json({ result: false, message: 'No unread notifications found for the user' });
    }

});



  module.exports = router;