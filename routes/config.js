var express = require('express');
var router = express.Router();

const Config = require('../models/config');

router.get('/:configName', (req, res) => {
    Config.findOne({name: req.params.configName})
    .then(data => {
        data ? res.json({value: data.config}) : res.status(404).json({result: false, error: "Cette configuration n'existe pas"})
    })
})

router.post('/:configName', (req, res) => {
    Config.findOne({name: req.params.configName})
    .then(data => {
        if(data) {
            const updatedConfig = new Config(req.body.updatedConfig)
            updatedConfig.save()
            .then(res.json({result: true}))
        } else {
            res.status(404).json({result: false, error: "Cette configuration n'existe pas"})
        }
    })
})

module.exports = router;

