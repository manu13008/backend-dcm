const mongoose = require('mongoose');

const dcmSchema = mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    content:{ type:String, required: true},
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'souscategory', required: true },
    origins: {type :String ,required: true },
    target:  {type :String ,required: true },
    likes:[{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    date: Date,
    type: {type: Boolean ,required: true },

})
const dcm = mongoose.model('dcm', dcmSchema);

module.exports = dcm;