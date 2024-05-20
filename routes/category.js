var express = require('express');
var router = express.Router();
require('../models/category');

const Category = require('../models/category');

router.post('/name', function(req, res,) {
 
 Category.findOne({name: req.body.name}).then(data => {
  if (data === null){

  const newCategory = new Category({
    name: req.body.name,
  })
  newCategory.save().then(dataCategory=> {
    res.json({ result:true,  dataCategory});
  });
  }else {
    res.json({ result :false, error: 'The Category  already exists'});
  }
})
})

;
router.get('/all', (req, res) => {
  Category.find({})
      .then(data => {
          if (data) {
              const names = data.map(Category => Category.name);
              res.json({ result: true, CategoryNames: names });
          } else {
              res.json({ result: false, error: 'No sous-categories found' });
          }
      })
  })

module.exports = router;