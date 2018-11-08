const axios = require('axios');
const Access = require('./access-db')

//https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET

function getAccessToken() {
    return new Promise((resolve, reject) => {
        axios.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx96491a51058b7949&secret=116012e650ea99a8e675f36a98ac3dcf').then((result) => {
            let accessToken = result.data;
            let expires_on = new Date().getTime();
            accessToken.expires_on = expires_on;
            Access.create(accessToken);
            resolve(accessToken);
        }).catch((err) => {
            reject(err);
        });
    })
}

async function sendMessage(data) {

    let access = await Access.findOne();
    let accessToken;
    if(!!access){
        console.log('发现access');
        let expires_now = new Date().getTime();
        let expires_value = (expires_now - access.expires_on) / 1000;
        accessToken = access.access_token;
        if (expires_value >= 7200 || !expires_value) {
            console.log('时间已过');
            accessToken = await getAccessToken().access_token;
        }
    }else{
        console.log('没发现access');
        accessToken = await getAccessToken().access_token;
    }
    console.log(accessToken);
    axios({
        method: 'post',
        url: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + accessToken,
        data: data
    }).then(res => {
        console.log(res.data);
    })
}

module.exports = sendMessage;