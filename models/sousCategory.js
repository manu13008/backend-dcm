const mongoose = require('mongoose');

const  sousCategorySchema = mongoose.Schema({
    name: String,
    icon: String,
});
const sousCategory = mongoose.model('souscategory', sousCategorySchema);

module.exports = sousCategory;