const express = require("express");
const router = express.Router();
const DCM = require("../models/dcm");

// ROUTE LIKE DCM
router.post("/like", (req, res) => {
  const { userId, dcmId } = req.body;

  DCM.findById(dcmId)
    .then((dcm) => {
      if (!dcm) {
        return res.status(404).json({ message: "DCM non trouvé." });
      }
      //par userId
      const index = dcm.likes.indexOf(userId);

      if (index !== -1) {
        //  déjà liké, donc on retire le like
        dcm.likes.splice(index, 1);
      } else {
        // LE USER pas liké, donc on ajoute le like et on retire le dislike
        const dislikeIndex = dcm.dislikes.indexOf(userId);
        if (dislikeIndex !== -1) {
          dcm.dislikes.splice(dislikeIndex, 1);
        }
        dcm.likes.push(userId);
      }
      //enregistrer dans la base de donnee
      return dcm.save();
    })
    .then((dcm) => {
      res.status(200).json({ message: "Action like effectuée.", dcm });
    })
    .catch((error) => {
      res.status(500).json({ message: "Erreur serveur.", error });
    });
});

// Route POUR DISLIKER DCM
router.post("/dislike", (req, res) => {
  const { userId, dcmId } = req.body;

  DCM.findById(dcmId)
    .then((dcm) => {
      if (!dcm) {
        return res.status(404).json({ message: "DCM non trouvé." });
      }

      const index = dcm.dislikes.indexOf(userId);

      if (index !== -1) {
        // LE USER adeja dislike , on retire le dislike
        dcm.dislikes.splice(index, 1);
      } else {
        // Le user n'a pas disliké, donc on ajoute le dislike et on retire le like
        const likeIndex = dcm.likes.indexOf(userId);
        if (likeIndex !== -1) {
          dcm.likes.splice(likeIndex, 1);
        }
        dcm.dislikes.push(userId);
      }

      return dcm.save();
    })
    .then((dcm) => {
      res.status(200).json({ message: "Action dislike effectuée.", dcm });
    })
    .catch((error) => {
      res.status(500).json({ message: "Erreur serveur.", error });
    });
});

module.exports = router;
