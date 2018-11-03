const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:20811/schoolPritime', { useNewUrlParser: true });

mongoose.connection.on('connected', function () {
    console.log('Mongoose connection open to' + 'mongodb://localhost:27017/schoolPritime');
})

mongoose.connection.on('error', function (err) {
    console.log('Mongoose connection error' + err);
})

mongoose.connection.on('disconnected', function () {
    console.log('Mongoose connection disconnected');
})

module.exports = mongoose;