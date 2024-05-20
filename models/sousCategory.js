const mongoose = require('mongoose');

const  sousCategorySchema = mongoose.Schema({
    name: String,
    icon: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
    authors: [String],
});
const sousCategory = mongoose.model('souscategory', sousCategorySchema);

module.exports = sousCategory;