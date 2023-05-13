//let ItemType    = require('./enum/ItemType');
//let ItemRarity  = require('./enum/ItemRarity');
//let ItemSource  = require('./enum/ItemSource');
//let ItemEdition = require('./enum/ItemEdition');
const ItemUtil    = require('./ItemUtil');
const ItemRarity  = require('./enum/ItemRarity');
const ItemSource  = require('./enum/ItemSource');
const Crates      = require('./Crates');
//let items       = require('./ItemList');
const db          = require('../database/mongo/');

function saveAccount(account, callback){
    account.save(err => {
        if(err) return callback(err);
        callback(null, account);
    });
}

exports.saveAccount = saveAccount;

function createInventoryItem(account, id){
    account.inventory[id] = {
        amount: 0
    };
}

function giveItem(account, id, amount = 1, save = false, callback = () => {}){
    if(!account.inventory.hasOwnProperty(id)) createInventoryItem(account, id);
    if(isNaN(amount)) return callback('Amount is not a number.');

    account.inventory[id].amount += amount;
    account.markModified('inventory');

    if(save) saveAccount(account, callback);
    else callback(null, account);
}

exports.giveItem = giveItem;

function addSpoobux(account, amount, save = false, callback = () => {}){
    if(isNaN(amount)) return callback('Invalid amount');

    amount = Math.floor(amount);

    account.spoobux += amount;

    if(save) saveAccount(account, callback);
    else callback(null, account);
}

exports.addSpoobux = addSpoobux;

function removeSpoobux(account, amount, save = false, callback = () => {}){
    addSpoobux(account, amount*-1, save, callback);
}

function incSpoobux(uuid, amount = 1, callback = () => {}) {
    db.Account.update({ uuid }, { $inc:{ spoobux: amount } }, { upsert: false }, callback);
}

exports.incSpoobux = incSpoobux;

//For accounts that have not been looked up; if only an IGN is present

exports.Purchase = function(account, id, amount, callback = () => {}){
    if(!ItemUtil.isPurchasable(id)) return callback('That item is not purchasable.');

    if(isNaN(amount) || amount < 1) return callback('Invalid amount.');

    if(!ItemUtil.canAfford(account.spoobux, id, amount)) return callback('The user cannot afford this item.');

    removeSpoobux(account, ItemUtil.getItemCost(id, amount), false, (err, account) => {
        if(err) return callback(err);

        giveItem(account, id, amount, false, (err, account) => {
            if(err) return callback(err);

            saveAccount(account, callback);
        });
    });
};

Object.values = function (obj) {
    const arr = [];
    for(const item of (Object.keys(obj))){
        arr.push(obj[item]);
    }
    return arr;
};

exports.tradeUp = function (account, id, callback = () => {}) {
    if(!ItemUtil.itemExists(id)) return callback('Item does not exist.');
    if(ItemUtil.getItem(id).source != ItemSource.CRATE) return callback('Cannot trade up non-crate items.');
    if(ItemUtil.getItem(id).rarity.equals(ItemRarity.MYTHICAL)) return callback('Cannot trade up from this rarity.');
    if(ItemUtil.getAccountItemAmount(account, id) < 10) return callback('Not enough items to trade up.');

    giveItem(account, id, -10, false);

    const RarityValues = Object.values(ItemRarity);

    const nextRarity = RarityValues[RarityValues.indexOf(ItemUtil.getItem(id).rarity)+1];

    const possibleItems =  new Crates.Crate().getItemsForRarity(nextRarity);

    const tradeupItem   = Crates.Crate.getRandomItemFromItems(possibleItems);

    giveItem(account, tradeupItem.id, 1, true, (err, account) => {
        if(err) return callback(err);

        callback(null, tradeupItem);
    });
};