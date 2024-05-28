var express = require('express');
var router = express.Router();

const Config = require('../models/config');
const { authenticateAdmin } = require('../modules/authentication');

router.get('/:configName', authenticateAdmin, (req, res) => {
    Config.findOne({name: req.params.configName})
    .then(data => {
        data ? res.json({value: data.value}) : res.status(404).json({result: false, error: "Cette configuration n'existe pas"})
    })
})

router.post('/:configName', authenticateAdmin, (req, res) => {
    console.log(req.body.config)
    Config.findOneAndUpdate({name: req.params.configName}, {value: JSON.stringify(req.body.config)})
    .then(data => {console.log('')} )
})

module.exports = router;

