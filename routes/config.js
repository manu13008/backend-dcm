var express = require('express');
var router = express.Router();
const sousCategory = require('../models/sousCategory')
const Category = require('../models/category')
const { moderationEvaluate } = require('../modules/moderationGPT');

const Config = require('../models/config');
const { authenticate } = require('../modules/authentication');

router.get('/modCriteria', (req, res) => {
    Config.findOne({name: 'modCriteria'})
    .then(data => {
        data ? res.json({value: JSON.parse(data.value)}) : res.status(404).json({result: false, error: "Cette configuration n'existe pas"})
    })
})

router.post('/modCriteria', authenticate('mustBeAdmin'), (req, res) => {
    Config.findOneAndUpdate({name: 'modCriteria'}, {value: JSON.stringify(req.body.config)})
    .then(data => {console.log('')} )
})

router.delete('/deleteActor', authenticate('mustBeAdmin'), (req, res) => {
   const {actor, subCategory} = req.body
   sousCategory.updateOne(
    { name: subCategory },
    { $pull: { authors: actor } })
   .then(() => {res.json({result: true})})
})

router.post('/addActor', (req, res) => {
    const {actor, subCategory} = req.body
    sousCategory.updateOne(
     { name: subCategory },
     { $push: { authors: actor } })
    .then(data => {
        res.json({result: true})
        console.log(data)
    })
})

router.delete('/deleteSubCategory', authenticate('mustBeAdmin'), (req, res) => {
    const {subCategory} = req.body
    sousCategory.deleteOne({name: subCategory})
    .then(() => res.json({result: true}))
})

router.delete('/deleteCategory', authenticate('mustBeAdmin'), (req, res) => {
    const {category} = req.body
    Category.deleteOne({name: category})
    .then(() => res.json({result: true}))
})

router.get('/moderation/evaluate', async (req, res) => {
    evaluation = await moderationEvaluate(req.body.content)
    res.json({result: evaluation})
})

module.exports = router;

