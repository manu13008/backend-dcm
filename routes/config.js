var express = require('express');
var router = express.Router();
const sousCategory = require('../models/sousCategory')
const Category = require('../models/category')
const { moderationEvaluate } = require('../modules/moderationGPT');

const Config = require('../models/config');
const { authenticate } = require('../modules/authentication');

router.get('/:configName', (req, res) => {
    Config.findOne({name: req.params.configName})
    .then(data => {
        data ? res.json({value: JSON.parse(data.value)}) : res.status(404).json({result: false, error: "Cette configuration n'existe pas"})
    })
})

router.post('/:configName', authenticate('mustBeAdmin'), (req, res) => {
    console.log(req.body.config)
    Config.findOneAndUpdate({name: req.params.configName}, {value: JSON.stringify(req.body.config)})
    .then(data => {console.log('')} )
})

router.delete('/deleteActor', (req, res) => {
   const {actor, subCategory} = req.body
   sousCategory.updateOne(
    { name: subCategory },
    { $pull: { authors: actor } })
   .then(() => {res.json({result: true})})
})

router.delete('/deleteSubCategory', (req, res) => {
    const {subCategory} = req.body
    sousCategory.deleteOne({name: subCategory})
    .then(() => res.json({result: true}))
})

router.delete('/deleteCategory', (req, res) => {
    const {category} = req.body
    Category.deleteOne({name: category})
    .then(() => res.json({result: true}))
})

router.get('/moderation/evaluate', async (req, res) => {
    evaluation = await moderationEvaluate(req.body.content)
    res.json({result: evaluation})
})

module.exports = router;

