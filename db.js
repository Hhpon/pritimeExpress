const mongoose = require('mongoose');

let env = process.env.NODE_ENV || 'development'
let dbUrl = 'mongodb://127.0.0.1:20811/schoolPritime'

if (env === 'development') {
    dbUrl = 'mongodb://localhost/schoolPritime'
}

console.log(dbUrl);

mongoose.connect(dbUrl, { useNewUrlParser: true });

mongoose.connection.on('connected', function () {
    console.log('Mongoose connection open to' + dbUrl);
})

mongoose.connection.on('error', function (err) {
    console.log('Mongoose connection error' + err);
})

mongoose.connection.on('disconnected', function () {
    console.log('Mongoose connection disconnected');
})

module.exports = mongoose;