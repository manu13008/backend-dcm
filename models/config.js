const mongoose = require('mongoose');

const configSchema = mongoose.Schema({
    name: String,
    value: String,
});
const Config = mongoose.model('config', configSchema);

module.exports = Config;