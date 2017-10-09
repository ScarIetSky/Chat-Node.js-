const mongoose = require('./libs/mongoose');
const async = require('async');


function open(callback) {
    mongoose.connection.on('open', callback);
}
function dropDatabase(callback) {
    const db = mongoose.connection.db;
    db.dropDatabase(callback);
}
function requireModels(callback) {
    require('./models/user');
    async.each(Object.keys(mongoose.models), function (modelName, callback) {
        mongoose.models[modelName].ensureIndexes(callback);
    }, callback);
}
function createUser(callback) {

    const users = [
        {username: "User1", password: "user1"},
        {username: "User2", password: "user2"},
        {username: "Admin", password: "admin"}
    ];

    async.each(users, function (userData, callback) {
        let user = new mongoose.models.User(userData);
        user.save(callback);
    }, callback);
}


async.series([
    open,
    dropDatabase,
    requireModels,
    createUser
], function (err) {
    console.log(arguments);
    mongoose.disconnect(callback);
});

