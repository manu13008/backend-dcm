const mongoose = require('mongoose');

const dcmSchema = mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    content:String,
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'souscategory' },
    origins: String,
    target: String,
    likes:[{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    date: Date,
    type:Boolean,

})
const dcm = mongoose.model('dcm', dcmSchema);

module.exports = dcm;