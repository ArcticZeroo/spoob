const db          = require('../database/mongo/');
const MineplexAPI = require('../api/MineplexAPI');
const SpoobErrors   = require('../error/SpoobErrors');

exports.fromName = function (name, callback) {
    MineplexAPI.getPlayerUUID(name, (err, result) => {
        if(err) return callback(false, result.error);

        const account = new db.Account({
            username  : name,
            namelower : name.toLowerCase(),
            uuid      : result
        });

        callback(true, account);
    });
};

exports.fromUUID = function (uuid, callback) {
    MineplexAPI.getPlayerInfo(uuid, (err, result) => {
        if(err) return callback(false, result.error);

        const account = new db.Account({
            username  : result.getName(),
            namelower : result.getName().toLowerCase(),
            uuid
        });

        callback(true, account);
    });
};