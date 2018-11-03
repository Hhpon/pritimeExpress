const express = require('express');
const bodyParser = require('body-parser');
const User = require('./user-db');
const Pritime = require('./pritime-db');

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
    let openId = req.body.code;
    let userInfo = req.body.userInfo;

    userInfo.openId = openId;

    console.log(userInfo);

    User.create(userInfo, (err, docs) => {
        if (err) {
            res.send('no')
        }
        res.send('ok');
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
    console.log(userInfo);
    res.json(userInfo);
})

app.post('/issuePritime', async (req, res) => {
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

    const userInfo = await User.findOne({ openId: openId })
    personInfomation.avatarUrl = userInfo.avatarUrl;
    personInfomation.nickName = userInfo.nickName;
    personInfomation.openId = openId;
    personInfomation.orderStatus = 0;

    console.log(personInfomation);

    await Pritime.create(personInfomation)

    res.end('ok')
})

app.get('/getUserRecord', async (req, res) => {
    let openId = req.query.openId;

    let userRecord = await Pritime.findOne({ openId: openId })
    console.log(userRecord);
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

    let order = await Pritime.find({ openId: openid, orderStatus: orderStatus });

    if (order) {
        res.json(order);
        return;
    }

    res.end('order')
})

app.get('/editOrder', async (req, res) => {
    let _id = req.query._id;
    let editType = req.query.editType;

    if (editType === 'complete') {
        await Pritime.updateOne({ _id: _id }, { orderStatus: 2 })
    } else if (editType === 'del') {
        await Pritime.deleteOne({ _id: _id })
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

    Pritime.updateOne({ _id: _id }, { orderStatus: 1, contactName: name, contactSex: sex, contactTelNum: telNum, contactWechatNum: wechatNum }, (err, doc) => {
        if (err) {
            res.end('no');
            return;
        }
        res.end('ok');
    })
})

app.listen(3001, () => {
    console.log('Server listenning part 3000');
})