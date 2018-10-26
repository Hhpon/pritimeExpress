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
        if (!personInfomation[item]) {
            res.end('no');
            return;
        }
    }

    const userInfo = await User.findOne({ openId: openId })
    personInfomation.avatarUrl = userInfo.avatarUrl;
    personInfomation.nickName = userInfo.nickName;
    personInfomation.openId = openId;

    console.log(personInfomation);
    Pritime.create(personInfomation, (err, docs) => {

    })

    res.end('ok')
})

app.listen(3000, () => {
    console.log('Server listenning part 3000');
})