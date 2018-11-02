const mongoose = require('mongoose');

const PritimeSchema = new mongoose.Schema({
    name: String,
    telNum: String,
    sex: String,
    partimeDate: String,
    wechatNum: String,
    price: String,
    note: String,
    checkedList: Array,
    avatarUrl: String,
    nickName: String,
    orderStatus: Number,
    openId: String
})

module.exports = mongoose.model('Pritime', PritimeSchema);