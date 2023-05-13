const Accounts = require('./account');

function getItemCount(name, id, callback, account){
    if(account){
        account.inventory[id];
    }else{
        Accounts.find(name, (success, res) => {
            if(!success) return callback(false, res);

            res.spoobux -= amount;
            Accounts.save(res, callback);
        });
    }
}

function addItem(name, id, quantity, callback, account){

}

function removeItem(name, id, quantity, callback, account){
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

function setItem(name, id, quantity, callback, account){

}