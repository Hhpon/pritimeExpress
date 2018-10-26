const mongoose = require('./db.js');

const UserSchema = new mongoose.Schema({
    nickName: String,
    avatarUrl: String,
    gender: Number,
    country: String,
    province: String,
    city: String,
    language: String,
    openId: String
})

module.exports = mongoose.model('User', UserSchema);