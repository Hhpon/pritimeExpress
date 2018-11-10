const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios')
const User = require('./user-db');
const Pritime = require('./pritime-db');
const sendMessage = require('./sendMessage');

const app = express();

app.use(bodyParser.json());

//allow custom header and CORS
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

    if (req.method == 'OPTIONS') {
        res.send(200); /让options请求快速返回/
    }
    else {
        next();
    }
});

app.get('/', (req, res) => {
    res.end('hello world');
})

app.post('/getPritime', (req, res) => {
    let current = req.body.current;
    let todayDate = req.body.todayDate;
    let timeRadio;
    if (current == 0) {
        timeRadio = '第一节';
    } else if (current == 1) {
        timeRadio = '第二节';
    } else if (current == 2) {
        timeRadio = '第三节';
    } else if (current == 3) {
        timeRadio = '第四节';
    } else {
        timeRadio = '晚自习';
    }

    Pritime.find({ partimeDate: todayDate, timeRadio: timeRadio, orderStatus: 0 }, (err, docs) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            res.json(docs);
        }
    })
})

app.post('/onLogin', (req, res) => {
    let code = req.body.code;
    let userInfo = req.body.userInfo;

    axios({
        url: 'https://api.weixin.qq.com/sns/jscode2session?appid=wx96491a51058b7949&secret=116012e650ea99a8e675f36a98ac3dcf&js_code=' + code + '&grant_type=authorization_code'
    }).then(result => {
        console.log(result.data.openid);
        userInfo.openId = result.data.openid;
        console.log(userInfo.openid);
        User.create(userInfo, (err, docs) => {
            if (err) {
                console.log(err);
                res.send('no')
            }
            console.log('object');
            res.send(result.data.openid);
        })
    })
})

app.post('/updateUserinfo', (req, res) => {
    let openId = req.body.openid;
    let userInfo = req.body.userInfo;
    User.updateOne({ openId: openId }, userInfo, (err, docs) => {
        if (err) {
            res.end('更新用户信息出错')
        }
        res.end('更新用户信息成功！');
    });
})

app.get('/getUserinfo', async (req, res) => {
    let openId = req.query.openId;
    let userInfo = await User.findOne({ openId: openId })
    res.json(userInfo);
})

app.post('/issuePritime', async (req, res) => {
    let personInfomation = req.body.personInfomation;
    let openId = req.body.openId;
    let formId = req.body.formId;

    for (let item in personInfomation) {
        if (item !== 'note') {
            if (!personInfomation[item]) {
                res.end('no');
                return;
            }
        }
    }

    const userInfo = await User.findOne({ openId: openId })
    personInfomation.avatarUrl = userInfo.avatarUrl;
    personInfomation.nickName = userInfo.nickName;
    personInfomation.openId = openId;
    personInfomation.formId = formId;
    personInfomation.orderStatus = 0;

    console.log(personInfomation);

    await Pritime.create(personInfomation)

    res.end('ok')
})

app.get('/getUserRecord', async (req, res) => {
    let openId = req.query.openId;

    let userRecord = await Pritime.findOne({ openId: openId })
    console.log(userRecord);
    console.log('getUserRecord');
    if (userRecord) {
        res.json(userRecord);
    } else {
        res.send('无用户记录');
    }
})

app.get('/getOrder', async (req, res) => {
    let openid = req.query.openid;
    let navigatorType = req.query.navigatorType;
    let orderStatus = 0;

    if (navigatorType === 'onGoing') {
        orderStatus = 1;
    } else if (navigatorType === 'onCompleting') {
        orderStatus = 2;
    }

    let order = await Pritime.find({ $or: [{ openId: openid, orderStatus: orderStatus }, { contactOpenId: openid, orderStatus: orderStatus }] });

    res.json(order);
})

app.get('/editOrder', async (req, res) => {
    let _id = req.query._id;
    let editType = req.query.editType;

    if (editType === 'complete') {
        await Pritime.updateOne({ _id: _id }, { orderStatus: 2 })
    } else if (editType === 'del') {
        await Pritime.deleteOne({ _id: _id })
    } else if (editType === 'return') {
        await Pritime.updateOne({ _id: _id }, { orderStatus: 0, $unset: { contactName: '', contactSex: '', contactTelNum: '', contactWechatNum: '', contactOpenId: '' } })
    }
    res.end('ok')
})

app.post('/addUserInfo', (req, res) => {

    let personInfomation = req.body.personInfomation;
    let openId = req.body.openId;

    for (let item in personInfomation) {
        if (item !== 'note') {
            if (!personInfomation[item]) {
                res.end('no');
                return;
            }
        }
    }

    let name = personInfomation.name;
    let sex = personInfomation.sex;
    let telNum = personInfomation.telNum;
    let wechatNum = personInfomation.wechatNum;

    User.updateOne({ openId: openId }, { name: name, sex: sex, telNum: telNum, wechatNum: wechatNum }, (err, doc) => {
        if (err) {
            res.end('no');
            return;
        }
        res.end('ok');
    });
})

app.get('/orderContact', async (req, res) => {
    let _id = req.query._id;
    let openId = req.query.openId;

    const userInfo = await User.findOne({ openId: openId })

    let name = userInfo.name;
    let telNum = userInfo.telNum;
    let wechatNum = userInfo.wechatNum;
    let sex = userInfo.sex;

    let pritimeMes = await Pritime.findOne({ _id: _id });

    console.log(object);

    if(Pritime.orderStatus != 0){
        res.send('already')
        return;
    }

    let options = {
        "touser": pritimeMes.openId,
        "template_id": "yAo8fZ9yoGDYNiLbtF-tTooeGBsT3dbIDvF7j5KyV0M",
        "page": "pages/order/order?type=onGoing",
        "form_id": pritimeMes.formId,
        "data": {
            "keyword1": {
                "value": name
            },
            "keyword2": {
                "value": wechatNum
            },
            "keyword3": {
                "value": telNum
            },
            "keyword4": {
                "value": pritimeMes.partimeDate
            },
            "keyword5": {
                "value": pritimeMes.timeRadio
            },
            "keyword6": {
                "value": "消息已经下发，请尽快取得联系!"
            }
        }
    }

    sendMessage(options);

    Pritime.updateOne({ _id: _id }, { orderStatus: 1, contactName: name, contactSex: sex, contactTelNum: telNum, contactWechatNum: wechatNum, contactOpenId: openId }, (err, doc) => {
        if (err) {
            console.log(err);
            res.send('no');
            return;
        }
        res.send('ok');
    })
})

app.listen(3001, () => {
    console.log('Server listenning part 3001');
})