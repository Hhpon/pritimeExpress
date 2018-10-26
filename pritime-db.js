const mongoose = require('mongoose');

const PritimeSchema = new mongoose.Schema({
    name: String,
    telNum: String,
    sex: String,
    partimeDate: String,
    wechatNum: String,
    price: String,
    checkedList: Array,
    acatarUrl: String,
    nickName: String,
    openId: String
})

module.exports = mongoose.model('Pritime', PritimeSchema);