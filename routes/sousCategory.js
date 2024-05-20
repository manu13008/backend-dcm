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
router.post('/authors/:sousCategoryName', (req, res) => {
    let sousCategoryName = req.params.sousCategoryName.replaceAll('_',' ');
    sousCategory.findOne({name: sousCategoryName}).then(sousCategory => {
        console.log(sousCategoryName)
        if (sousCategory === null) {
            res.json({ result: false, error: 'Sous-category not found' });
        } else {
            if (sousCategory.authors.includes(req.body.name)) {
                res.json({ result: false, error: 'The author already exists' });
            } else {
                sousCategory.authors.push(req.body.name);
                sousCategory.save().then(updatedSousCategory => {
                    console.log(sousCategoryName)
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

// route get de tout les auteurs
        router.get('/allAuthors', (req, res) => {
            sousCategory.find({})
            .then(data => {
                if (data) {
                    const namesAuthors = data.map(data => data.authors);
                    res.json({ result: true, allAuthors: namesAuthors });
                } else {
                    res.json({ result: false, error: 'No authors found' });
                }
            })
    })

//route get recupere l'id via le nom
router.get('/:sousCategoryName', (req, res) => {
    const sousCategoryName = req.params.sousCategoryName;
    const regex = new RegExp(sousCategoryName, 'i');
    sousCategory.findOne({name: regex})
        .then(data => {
            if (data) {
                console.log(data)
                res.json({ result: true, sousCategory: {name: data.name, id: data._id} });
            } else {
                res.json({ result: false, error: 'No category found with this name' });
            }
        })

})
    
module.exports = router;