const db            = require('../database/mongo/');
const createAccount = require('./create');
const SpoobErrors   = require('../error/SpoobErrors');

exports.fromName = (name, callback, create_if_not_available) => {
    create_if_not_available = create_if_not_available || true;
    db.Account.findOne({ namelower: name.toLowerCase() }, (err, account) => {
        if(err) return callback(false, SpoobErrors.ACCOUNT_LOOKUP_ERROR);
        if(!account){
            if(create_if_not_available) {
                createAccount.fromName(name, (success, result) => {
                    if (!success) return callback(false, result);

                    callback(true, result);
                });
            }else{
                callback(false, SpoobErrors.ACCOUNT_NOT_FOUND);
            }
            return;
        }

        callback(true, account);
    });
};

exports.fromUUID = (uuid, callback, create_if_not_available) => {
    create_if_not_available = create_if_not_available || true;
    db.Account.findOne({ uuid }, (err, account) => {
        if(err) return callback(false, SpoobErrors.ACCOUNT_LOOKUP_ERROR);
        if(!account){
            if(create_if_not_available){
                createAccount.fromUUID(uuid, (success, result) => {
                    if(!success) return callback(false, result);

                    callback(true, result);
                });
            }else{
                callback(false, SpoobErrors.ACCOUNT_NOT_FOUND);
            }
            return;
        }

        callback(true, account);
    });
};

exports.fromSlack = slack => {
    return new Promise((resolve, reject) => {
        db.Account.findOne({ slack }, (err, account) => {
            if(err)      return reject(SpoobErrors.ACCOUNT_LOOKUP_ERROR);
            if(!account) return reject(SpoobErrors.ACCOUNT_NOT_FOUND);

            resolve(account);
        });
    });
};
