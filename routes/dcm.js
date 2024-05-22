const mongoose = require('mongoose');
var express = require('express');
var router = express.Router();
require('../models/dcm');
const User=require('../models/users');

const Dcm = require('../models/dcm');
const sousCategory = require('../models/sousCategory');

// poster un DCM
router.post('/send', function(req,res) {
    User.findOne({token: req.body.authors}).then(user => {
        if(user){
            Dcm.findOne({content: req.body.content}).then(existingDcm => {
                if(existingDcm === null ){
                    const newDcm = new Dcm({
                        author: user._id,
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
        } else {
            res.json({result:false, error: 'Invalid token'})
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
router.get('/user/:token', (req, res) => {
    const userToken = req.params.token; 
    const regex = new RegExp(userToken, 'i');
    User.findOne({ username: regex }) 
        .then(user => {
            if (!user) {
                res.json({ result: false, error: 'No user found with this username' });
            } else {
                Dcm.find({ author: user._id })
                    .then(dcmData => {
                        res.json({ result: true, username: { author: user.username }, id: user._id, dcm: dcmData });
                    })
            }
        })
    })


// supprimer un dcm
router.delete('/deletedcm/:id', (req, res) => {
    const userId = req.userId;

    Dcm.findOneAndDelete({ _id: req.params.id, author: userId })
        .then(deletedDcm => {
            if (deletedDcm) {
                res.json({ result: true, message: 'DCM deleted successfully' });
            } else {
                res.json({ result: false, error: 'No DCM found with this ID or you are not the author' });
            }
        })
})

module.exports = router;