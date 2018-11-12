const mongoose = require('./db.js');

const PritimeSchema = new mongoose.Schema({
    name: String,
    telNum: String,
    sex: String,
    partimeDate: String,
    wechatNum: String,
    price: String,
    note: String,
    timeRadio: String,
    avatarUrl: String,
    nickName: String,
    orderStatus: Number,
    openId: String,
    formId: String,
    contactName: String,
    contactSex: String,
    contactTelNum: String,
    contactWechatNum: String,
    contactOpenId:String,
    contactForId: String
})

module.exports = mongoose.model('Pritime', PritimeSchema);