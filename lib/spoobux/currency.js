const Accounts = require('./account');

function addSpoobux(name, amount, callback, account) {
    if(account){
        account.spoobux += amount;
        Accounts.save(account, callback);
    }else{
        Accounts.find(name, (success, res) => {
            if(!success) return callback(false, res);

            res.spoobux += amount;
            Accounts.save(res, callback);
        });
    }
}

function removeSpoobux(name, amount, callback, account) {
    if(account){
        account.spoobux -= amount;
        Accounts.save(account, callback);
    }else{
        Accounts.find(name, (success, res) => {
            if(!success) return callback(false, res);

            res.spoobux -= amount;
            Accounts.save(res, callback);
        });
    }
}

function setSpoobux(name, amount, callback, account){
    if(account){
        account.spoobux = amount;
        Accounts.save(account, callback);
    }else{
        Accounts.find(name, (success, res) => {
            if(!success) return callback(false, res);

            res.spoobux = amount;
            Accounts.save(res, callback);
        });
    }
}

exports.add    = addSpoobux;
exports.remove = removeSpoobux;
exports.set    = setSpoobux;