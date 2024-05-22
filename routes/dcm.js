const mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
require('../models/dcm');
const User=require('../models/users');

const { authenticateToken } = require('../modules/authentication')

const Dcm = require('../models/dcm');
const sousCategory = require('../models/sousCategory');

// poster un DCM
router.post('/send', authenticateToken, function(req,res) {
    Dcm.findOne({content: req.body.content}).then(existingDcm => {
        if(existingDcm === null ){
            const newDcm = new Dcm({
                author: req.userId,
                content: req.body.content,
                subCategory: req.body.subCategory,
                origins:req.body.origins,
                target:req.body.target,
                likes:[],
                dislikes:[],
                date: Date.now(),
                type: req.body.type === 'true',
            })
            newDcm.save().then(savedDcm => {
                console.log(savedDcm.origins)
                const date = new Date(savedDcm.date);
                const formattedDate = date.toLocaleDateString('fr-FR', {
                    day: '2-digit',  
                    month: '2-digit',  
                    year: 'numeric',  
                });
                savedDcm = savedDcm.toObject();  
                savedDcm.date = formattedDate;
                res.json({result:true, savedDcm})
            });
            }else {
                res.json({result:false, error: 'The Dcm already exist'})
            }
    })   
})
// recuperer tout les Derniers DCM
router.get('/lastDcm', (req,res)=> {
    Dcm.find().sort({_id:-1}).limit(10).then(data =>{
        if(data){
            res.json({result:true, data})
        }else{
            res.json({result:false, error:'No DCM found'})
        }
    })
})


// Récupérer des dcm aléatoires 
router.get('/random', (req,res)=> {
    Dcm.aggregate([ { $sample: { size: 20 } } ]).then(data => {
        if (data){
            res.json({result : true, data})
        } else {
            res.json({result : false, error:'No random DCM found'})
        }
    })
})

// Récupérer les dcm les plus likés de tous les temps : classement par la meilleure différence 
// entre positif et négatif
router.get('/mostLiked', (req,res)=> {
    Dcm.aggregate([
        {
            $addFields: {
                likeCount: { $size: "$likes" },
                dislikeCount: { $size: "$dislikes" },
                difference: { $subtract: [{ $size: "$likes" }, { $size: "$dislikes" }] }
             
          }
        },
        {
          $sort: { difference: -1 } // -1 pour un tri décroissant, 1 pour un tri croissant
        }
      ]).then(data => {
        if (data) {
            res.json({result : true, data})
        } else {
            res.json({result : false, error : 'No dcm find or impossible to order them'})
        }
      })
    })


// Récupérer les dcm COUP DE COEUR les plus likés de tous les temps : classement par la meilleure différence 
// entre positif et négatif
router.get('/mostLikedHeart', (req,res)=> {
    Dcm.aggregate([
        {
            $match: { type: true } ,// Filtrer les documents où type est true (coup de coeur)
        },
        {
            $addFields: {
                likeCount: { $size: "$likes" },
                dislikeCount: { $size: "$dislikes" },
                difference: { $subtract: [{ $size: "$likes" }, { $size: "$dislikes" }] }
             
          }
        },
        {
          $sort: { difference: -1 } // -1 pour un tri décroissant, 1 pour un tri croissant
        }
      ]).then(data => {
        if (data) {
            res.json({result : true, data})
        } else {
            res.json({result : false, error : 'No dcm find or impossible to order them'})
        }
      })

})



// Récupérer les dcm COUP DE GUEULE les plus likés de tous les temps : classement par la meilleure différence 
// entre positif et négatif
router.get('/mostLikedHate', (req,res)=> {
    Dcm.aggregate([
        {
            $match: { type: false } ,// Filtrer les documents où type est false(coup de gueule)
        },
        {
            $addFields: {
                likeCount: { $size: "$likes" },
                dislikeCount: { $size: "$dislikes" },
                difference: { $subtract: [{ $size: "$likes" }, { $size: "$dislikes" }] }
             
          }
        },
        {
          $sort: { difference: -1 } // -1 pour un tri décroissant, 1 pour un tri croissant
        }
      ]).then(data => {
        if (data) {
            res.json({result : true, data})
        } else {
            res.json({result : false, error : 'No dcm find or impossible to order them'})
        }
      })

})


    
    
    





// recuperer tout les DCM d'une sous catégories
router.get('/:sousCategoryName', (req, res) => {
    let sousCategoryName = req.params.sousCategoryName.replaceAll('_',' ');
    const regex = new RegExp(sousCategoryName, 'i');
    sousCategory.findOne({name: regex})
        .then(data => {
            if (data) {
                console.log('ok')
               Dcm.find({subCategory: data._id})
               .then(dcmData => {
                res.json({result:true, sousCategory:{name: data.name}, id:data._id, dcm:dcmData})
               })
            } else {
                res.json({ result: false, error: 'No DCM found with this name' });
            }
        })

})


// recuperer tout les DCM d'un utilisateur via le token
router.get('/user/:username', (req, res) => {
    const username = req.params.username; 
    const regex = new RegExp(username, 'i');
    User.findOne({ username: regex }) 
        .then(user => {
            if (!user) {
                res.json({ result: false, error: "Aucun utilisateur pour ce pseudonyme" });
            } else {
                Dcm.find({ author: user._id })
                    .then(dcmData => {
                        res.json({ result: true, author: user.username, dcm: dcmData });
                    })
            }
        })
    })


// supprimer une dcm
router.delete('/deletedcm/:id', authenticateToken, (req, res) => {
    const userId = req.userId;

    Dcm.findOne({_id: req.params.id})
    .then(data => {
        !(data.author === req.userId) && res.sendStatus(401).json({result: false, error: "Vous n'êtes pas autorisé à supprimer cette DCM"})
    })

    Dcm.findOneAndDelete({ _id: req.params.id })
        .then(deletedDcm => {
            if (deletedDcm) {
                res.json({ result: true, message: 'DCM supprimée avec succès' });
            } else {
                res.json({ result: false, error: 'Pas de DCM trouvée pour cet identifiant' });
            }
        })
})



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