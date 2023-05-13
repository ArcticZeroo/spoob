const log = require('frozor-logger');
const db  = require('../database/mongo/');

function saveAccount(account, callback){
    account.save(err => {
        if(err){
            log.error(`Unable to create account ${account.username}: ${err}`);
            if(callback) callback(false, err);
            return;
        }
        if(callback) callback(true);
    });
}

function createAccount(name, callback){
    const account       = new db.Account();
    account.username  = name;
    account.namelower = name;

    saveAccount(account, callback);
}

function findAccount(name, callback) {
    db.Account.findOne({ namelower: name.toLowerCase() }, (err, res) => {
        if(err)  return callback(false, err);
        if(!res) return callback(false, res);

        callback(true, res);
    });
}

exports.save   = saveAccount;
exports.create = createAccount;
exports.find   = findAccount;