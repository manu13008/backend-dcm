const mongoose = require("mongoose");
var express = require("express");
var router = express.Router();
require("../models/dcm");
const User = require("../models/users");
const Notification = require("../models/notification");

const { authenticate } = require("../modules/authentication");

const Dcm = require("../models/dcm");
const sousCategory = require("../models/sousCategory");


const { moderationEvaluate } = require("../modules/moderationGPT");

// poster un DCM
router.post("/send", authenticate("allowAnonym"), async function (req, res) {
  const evaluation = await moderationEvaluate(req.body.content);
  Dcm.findOne({ content: req.body.content }).then((existingDcm) => {
    if (existingDcm === null) {
      const newDcm = new Dcm({
        author: req.userId,
        content: req.body.content,
        subCategory: req.body.subCategory,
        origins: req.body.origins,
        target: req.body.target,
        likes: [],
        dislikes: [],
        date: Date.now(),
        type: req.body.type,
        isAnonym: req.body.isAnonym,
        mod_isSensitiveContent: evaluation.toCensor,
        mod_isCensored: evaluation.toCensor,
        mod_flags: evaluation.criteria,
      });
      newDcm.save().then((savedDcm) => {
        console.log(savedDcm.origins);
        const date = new Date(savedDcm.date);
        const formattedDate = date.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        savedDcm = savedDcm.toObject();
        savedDcm.date = formattedDate;
        res.json({ result: true, savedDcm });
      });
    } else {
      res.json({ result: false, error: "The Dcm already exist" });
    }
  });
});
// recuperer tout les Derniers DCM
router.get("/lastDcm", (req, res) => {
  // Récupérez le numéro de page depuis les paramètres de requête
  // Utilisez 0 comme valeur par défaut si aucun numéro de page n'est fourni
  const page = parseInt(req.query.page) || 0;

  // Définissez la taille de la page (le nombre de documents à récupérer par page)
  const pageSize = 5;
  // Dcm.find()
  // .sort({ _id: -1 })
  // .limit(5)
  // Dcm.aggregate([{ $sample: { size: 20 } }])

  Dcm.aggregate([
    {
      $match: { mod_isCensored: false },
    },

    {
      $sort: { date: -1 }, // -1 pour un tri décroissant, 1 pour un tri croissant
    },
    {
      $skip: page * pageSize, // Sautez les documents des pages précédentes
    },
    {
      $limit: pageSize, // Limitez le nombre de documents à la taille de la page
    },
  ])
    .then(async (data) => {
      const populatedData = await Dcm.populate(data, [
        { path: "author", select: "username", model: User },
        { path: "subCategory", select: "name", model: sousCategory },
      ]);

      if (populatedData) {
        res.json({ result: true, data: populatedData });
      } else {
        res.json({ result: false, error: "No random DCM found" });
      }
    })
    .catch((error) => res.json({ result: false, error: error.message }));
});

// Récupérer des dcm aléatoires
router.get("/random", (req, res) => {
  Dcm.aggregate([
    { $match: { mod_isCensored: false } },
    { $sample: { size: 5 } },
  ])
    .then(async (data) => {
      const populatedData = await Dcm.populate(data, [
        { path: "author", select: "username", model: User },
        { path: "subCategory", select: "name", model: sousCategory },
      ]);

      if (populatedData) {
        res.json({ result: true, data: populatedData });
      } else {
        res.json({ result: false, error: "No random DCM found" });
      }
    })
    .catch((error) => res.json({ result: false, error: error.message }));
});

// Récupérer les dcm les plus likés de tous les temps : classement par la meilleure différence
// entre positif et négatif
router.get("/mostLiked", (req, res) => {
  console.log('totoooo')
  // Récupérez le numéro de page depuis les paramètres de requête
  // Utilisez 0 comme valeur par défaut si aucun numéro de page n'est fourni
  const page = parseInt(req.query.page) || 0;

  // Définissez la taille de la page (le nombre de documents à récupérer par page)
  const pageSize = 5;
  Dcm.aggregate([
    {
      $addFields: {
        likeCount: { $size: "$likes" },
        dislikeCount: { $size: "$dislikes" },
        difference: {
          $subtract: [{ $size: "$likes" }, { $size: "$dislikes" }],
        },
      },
    },
    {
      $match: { mod_isCensored: false },
    },
    {
      $sort: { difference: -1 }, // -1 pour un tri décroissant, 1 pour un tri croissant
    },
    {
      $skip: page * pageSize, // Sautez les documents des pages précédentes
    },
    {
      $limit: pageSize, // Limitez le nombre de documents à la taille de la page
    }

  ]).then(async (data) => {
    const populatedData = await Dcm.populate(data, [
      { path: "author", select: "username", model: User },
      { path: "subCategory", select: "name", model: sousCategory },
    ]);

    if (populatedData) {
      res.json({ result: true, data: populatedData });
    } else {
      res.json({
        result: false,
        error: "No DCM found or impossible to order them",
      });
    }
  });
});

// Récupérer les dcm COUP DE COEUR les plus likés de tous les temps : classement par la meilleure différence
// entre positif et négatif
router.get("/mostLikedHeart", (req, res) => {
  // Récupérez le numéro de page depuis les paramètres de requête
  // Utilisez 0 comme valeur par défaut si aucun numéro de page n'est fourni
  const page = parseInt(req.query.page) || 0;

  // Définissez la taille de la page (le nombre de documents à récupérer par page)
  const pageSize = 5;

  Dcm.aggregate([
    {
      $match: { type: true }, // Filtrer les documents où type est true (coup de coeur)
    },
    {
      $match: { mod_isCensored: false },
    },
    {
      $addFields: {
        likeCount: { $size: "$likes" },
        dislikeCount: { $size: "$dislikes" },
        difference: {
          $subtract: [{ $size: "$likes" }, { $size: "$dislikes" }],
        },
      },
    },
    {
      $sort: { difference: -1 }, // -1 pour un tri décroissant, 1 pour un tri croissant
    },
    {
      $skip: page * pageSize, // Sautez les documents des pages précédentes
    },
    {
      $limit: pageSize, // Limitez le nombre de documents à la taille de la page
    },
  ]).then(async (data) => {
    const populatedData = await Dcm.populate(data, [
      { path: "author", select: "username", model: User },
      { path: "subCategory", select: "name", model: sousCategory },
    ]);

    if (populatedData) {
      res.json({ result: true, data: populatedData });
    } else {
      res.json({
        result: false,
        error: "No DCM found or impossible to order them",
      });
    }
  });
});

// Récupérer les dcm COUP DE GUEULE les plus likés de tous les temps : classement par la meilleure différence
// entre positif et négatif
router.get("/mostLikedHate", (req, res) => {
  // Récupérez le numéro de page depuis les paramètres de requête
  // Utilisez 0 comme valeur par défaut si aucun numéro de page n'est fourni
  const page = parseInt(req.query.page) || 0;

  // Définissez la taille de la page (le nombre de documents à récupérer par page)
  const pageSize = 5;
  Dcm.aggregate([
    {
      $match: { type: false }, // Filtrer les documents où type est false(coup de gueule)
    },
    {
      $match: { mod_isCensored: false },
    },
    {
      $addFields: {
        likeCount: { $size: "$likes" },
        dislikeCount: { $size: "$dislikes" },
        difference: {
          $subtract: [{ $size: "$likes" }, { $size: "$dislikes" }],
        },
      },
    },
    {
      $sort: { difference: -1 }, // -1 pour un tri décroissant, 1 pour un tri croissant
    },
    {
      $skip: page * pageSize, // Sautez les documents des pages précédentes
    },
    {
      $limit: pageSize, // Limitez le nombre de documents à la taille de la page
    },
  ]).then(async (data) => {
    const populatedData = await Dcm.populate(data, [
      { path: "author", select: "username", model: User },
      { path: "subCategory", select: "name", model: sousCategory },
    ]);

    if (populatedData) {
      res.json({ result: true, data: populatedData });
    } else {
      res.json({
        result: false,
        error: "No DCM found or impossible to order them",
      });
    }
  });
});

// recuperer tout les DCM d'une sous catégories

router.get("/:sousCategoryName", (req, res) => {
  let sousCategoryName = req.params.sousCategoryName.replaceAll("_", " ");
  const regex = new RegExp(sousCategoryName, "i");

  sousCategory.findOne({ name: regex }).then((data) => {
    if (data) {
      console.log("ok");
      Dcm.find({ subCategory: data._id })
        .populate({ path: "author", select: "username", model: User })
        .populate({ path: "subCategory", select: "name", model: sousCategory })
        .populate({
          path: "subCategory",
          select: "authors",
          model: sousCategory,
        })
        .then((dcmData) => {
          res.json({
            result: true,
            sousCategory: { name: data.name },
            id: data._id,
            dcm: dcmData,
          });
        });
    } else {
      res.json({ result: false, error: "No DCM found with this name" });
    }
  });
});

// recuperer tout les DCM d'un utilisateur via le token
router.get("/user/:username", (req, res) => {
  const username = req.params.username;
  const regex = new RegExp(username, "i");
  User.findOne({ username: regex })
    .then((user) => {
      if (!user) {
        res.json({
          result: false,
          error: "Aucun utilisateur pour ce pseudonyme",
        });
      } else {
        Dcm.find({ author: user._id, mod_isCensored: false }).then(
          (dcmData) => {
            Dcm.populate(dcmData, [
              { path: "author", select: "username", model: User },
              { path: "subCategory", select: "name", model: sousCategory },
            ]).then((populatedData) => {
              res.json({
                result: true,
                author: user.username,
                dcm: populatedData,
              });
            });
          }
        );
      }
    })
    .catch((error) => res.json({ result: false, error: error.message }));
});

// supprimer une dcm
router.delete("/deletedcm/:id", authenticate(), (req, res) => {
  const userId = req.userId;
  console.log("alal");

  Dcm.findOne({ _id: req.params.id })
    .then((data) => {
      if (!data) {
        return res.status(404).json({
          result: false,
          error: "Pas de DCM trouvée pour cet identifiant",
        });
      }

      if (data.author.toString() !== userId) {
        console.log(data.author.toString());
        return res
          .status(401)
          .json({
            result: false,
            error: "Vous n'êtes pas autorisé à supprimer cette DCM",
          });
      }

      return Dcm.findOneAndDelete({ _id: req.params.id });
    })
    .then((deletedDcm) => {
      if (deletedDcm) {
        res.json({ result: true, message: "DCM supprimée avec succès" });
      }
    })
    .catch((err) => {
      res.status(500).json({ result: false, error: err.message });
    });
});

// ROUTE LIKE DCM
router.put("/like", authenticate(), (req, res) => {
  const dcmId = req.body.dcmId;
  const username = req.body.username;
  console.log("Route dcm like in process");

  // Check que l'id de la dcm existe sinon renvoie une erreur
  Dcm.findById(dcmId)
    .then((dcm) => {
      if (!dcm) {
        return res.status(404).json({ message: "DCM non trouvé." });
      }

      //par userId
      const index = dcm.likes.indexOf(req.userId);

      if (index !== -1) {
        //  déjà liké, donc on retire le like
        dcm.likes.splice(index, 1);
      } else {
        // LE USER pas liké, donc on ajoute le like et on retire le dislike
        const dislikeIndex = dcm.dislikes.indexOf(req.userId);
        if (dislikeIndex !== -1) {
          dcm.dislikes.splice(dislikeIndex, 1);
        }
        dcm.likes.push(req.userId);

        if (req.userId != dcm.author) {
          const notification = new Notification({
            userId: dcm.author,
            message: `🔥 Votre DCM a reçu un like de la part de ${req.body.username}.`,
            _dcm: dcm._id,
          });
          // console.log('notif',notification)
          notification.save();
        }
  
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

router.get("/likes/:username", (req, res) => {
  const username = req.params.username;
  const regex = new RegExp(username, "i");

  User.findOne({ username: regex })
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .json({
            result: false,
            error: "Aucun utilisateur pour ce pseudonyme",
          });
      }
      return Dcm.find({ likes: user._id });
    })
    .then((dcmData) => {
      return Dcm.populate(dcmData, [
        { path: "author", select: "username", model: User },
        { path: "subCategory", select: "name", model: sousCategory },
      ]);
    })
    .then((populatedData) => {
      res.status(200).json({ result: true, dcm: populatedData });
    })
    .catch((error) => {
      res.status(500).json({ result: false, error: error.message });
    });
});

// Route POUR DISLIKER DCM
router.put("/dislike", authenticate(), (req, res) => {
  const dcmId = req.body.dcmId;

  Dcm.findById(dcmId)
    .then((dcm) => {
      if (!dcm) {
        return res.status(404).json({ message: "DCM non trouvé." });
      }

      const index = dcm.dislikes.indexOf(req.userId);

      if (index !== -1) {
        // LE USER adeja dislike , on retire le dislike
        dcm.dislikes.splice(index, 1);
      } else {
        // Le user n'a pas disliké, donc on ajoute le dislike et on retire le like
        const likeIndex = dcm.likes.indexOf(req.userId);
        if (likeIndex !== -1) {
          dcm.likes.splice(likeIndex, 1);
        }
        dcm.dislikes.push(req.userId);
      }

      return dcm.save();
    })
    .then((dcm) => {
      res.status(200).json({ message: "Action dislike effectuée.", dcm: dcm });
    })
    .catch((error) => {
      res.status(500).json({ message: "Erreur serveur.", error });
    });
});

router.get("/uniqueDcm/:dcmId", (req, res) => {
  const dcmId = req.params.dcmId;
  Dcm.findById(dcmId).then((dcm) => {
    if (!dcm) {
      console.log("tesssst", dcm);
      res.json({ result: false, error: "Dcm introuvable" });
    } else {
      res.json({ result: true, dcm });
    }
  });
});

module.exports = router;
