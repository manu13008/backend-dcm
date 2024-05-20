var express = require('express');
var router = express.Router();
require('../models/sousCategory');

const sousCategory = require('../models/sousCategory');
// route ajout de sous categories
router.post('/name', function(req, res,) {
 
    sousCategory.findOne({name: req.body.name}).then(data => {
  if (data === null){

  const newSousCategory = new sousCategory ({
    name: req.body.name,
    category: req.body.categorys, 
  })
  newSousCategory.save().then(dataSousCategory=> {
    console.log(req.body.categorys);
    res.json({ result:true,  dataSousCategory});
  });
  }else {
    res.json({ result :false, error: 'The Category  already exists'});
  }
})
})

// route des auteurs 
router.post('/authors/:sousCategoryId', (req, res) => {
    sousCategory.findById(req.params.sousCategoryId).then(sousCategory => {
        const sousCategoryId = req.params.sousCategoryId;
        console.log(sousCategoryId)
        if (sousCategory === null) {
            res.json({ result: false, error: 'Sous-category not found' });
        } else {
            if (sousCategory.authors.includes(req.body.name)) {
                res.json({ result: false, error: 'The author already exists' });
            } else {
                sousCategory.authors.push(req.body.name);
                sousCategory.save().then(updatedSousCategory => {
                    console.log(sousCategoryId)
                    res.json({ result: true, allAuthors: updatedSousCategory.authors });
                });
            }
        }
    });
});
// route get des sous catégories 

router.get('/all', (req, res) => {
    sousCategory.find({})
        .then(data => {
            if (data) {
                const names = data.map(sousCategory => sousCategory.name);
                res.json({ result: true, sousCategoryNames: names });
            } else {
                res.json({ result: false, error: 'No sous-categories found' });
            }
        })
    })


    router.get('/allAuthors', (req, res) => {
        sousCategory.find({})
        .then(data => {
            if (data) {
                const namesAuthors = data.map(sousCategory => sousCategory.authors);
                res.json({ result: true, allAuthors: namesAuthors });
            } else {
                res.json({ result: false, error: 'No authors found' });
            }
        })
        })
    
module.exports = router;