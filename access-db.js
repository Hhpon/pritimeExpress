const mongoose = require('./db.js');

const AccessSchema = new mongoose.Schema({
    access_token: String,
    expires_in: Number,
    expires_on: Number
})

module.exports = mongoose.model('access_token', AccessSchema);