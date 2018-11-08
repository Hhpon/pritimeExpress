const axios = require('axios');
const Access = require('./access-db')

//https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET

function getAccessToken() {
    return new Promise((resolve, reject) => {
        axios.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx96491a51058b7949&secret=9ee9dad2583dcae1f34582781cd96551').then((result) => {
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
    let expires_now = new Date().getTime();
    let expires_value = (expires_now - access.expires_on) / 1000;
    let accessToken = access.access_token;
    if (expires_value >= 7200) {
        console.log('时间已过');
        accessToken = await getAccessToken().access_token;
    }
    axios({
        method: 'post',
        url: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + accessToken,
        data: data
    }).then(res => {
        console.log(res.data);
    })
}

module.exports = sendMessage;