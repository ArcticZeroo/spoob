const ItemUtil    = require('./ItemUtil');
const ItemRarity  = require('./enum/ItemRarity');
const ItemSource  = require('./enum/ItemSource');
const Crates      = require('./Crates');
const db          = require('../database/mongo/');

/**
 * Saves the account...
 * @param account {object} - The account to save
 * @return {Promise.<object>}
 */
function saveAccount(account){
    return new Promise((resolve, reject) => {
        account.save(err => {
            if (err) {
                return reject(err);
            }

            resolve(account);
        });
    });
}

/**
 * If the item is not in the user's inventory, create it with an amount of 0
 * @param account {object} - The account to create in.
 * @param id {number} - The item's ID
 */
function createInventoryItem(account, id){
    if (account.inventory.hasOwnProperty(id)) {
        return;
    }

    account.inventory[id] = {
        amount: 0
    };
}

/**
 * Give a user an item.
 * @param account {object} - The account to give the item to
 * @param id {number} - The item ID to be given
 * @param {number} [amount=1] - The amount of items to give
 * @param {boolean} [save=false] - Whether to save the account right now. If this is false you can do more account actions before save.
 * @return {Promise.<*>}
 */
async function giveItem(account, id, amount = 1, save = false){
    // Attempt to create the item if it does not exist
    createInventoryItem(account, id);

    if(isNaN(amount)) {
        throw new TypeError('Expected number for amount.');
    }

    account.inventory[id].amount += amount;

    account.markModified('inventory');

    if (save) {
        return saveAccount(account);
    } 
    return account;
    
}

/**
 * Add spoobux to an account.
 * @param account {object} - The account to add to
 * @param amount {number} - The amount of spoobux to add
 * @param {boolean} [save=false] - Whether to save the account right now. If this is false you can do more account actions before save.
 * @return {Promise.<*>}
 */
async function addSpoobux(account, amount, save = false){
    if(isNaN(amount)) {
        throw new TypeError('Expected number for amount.');
    } else if (typeof amount === 'string') {
        amount = parseInt(amount);
    }

    amount = Math.floor(amount);

    account.spoobux += amount;

    if (save) {
        return saveAccount(account);
    } 
    return account;
    
}

/**
 * Removes spoobux from a user.
 * @param account {object} - The account to remove from
 * @param amount {number} - The amount of spoobux to remove
 * @param {boolean} [save=false] - Whether to save the account right now. If this is false you can do more account actions before save.
 * @return {Promise.<*>}
 */
function removeSpoobux(account, amount, save = false){
    return addSpoobux(account, amount*-1, save);
}

/**
 * Increments spoobux for a UUID.
 * This should only be used if the account is not already known.
 * If the UUID does not exist in the database, it won't add to anyone.
 * @param uuid {string} - The user's uuid
 * @param {number} [amount=1] - The amount to increment.
 * @return {Promise}
 */
function incSpoobux(uuid, amount = 1) {
    return new Promise((resolve, reject) => {
        db.Account.update(
            { uuid },
            { $inc: { spoobux: amount } },
            { upsert: false },
            err => {
                if (err) {
                    return reject(err);
                }

                resolve();
            }
        );
    });
}

/**
 * Purchase an item.
 * This will remove spoobux, add the item, and save.
 * @param account {object} - The account to purchase on
 * @param id {number} - The item ID to purchase
 * @param {number} [amount=1] - How many of the item to purchase
 * @return {Promise.<*>}
 */
async function purchase(account, id, amount = 1){
    if(!ItemUtil.isPurchasable(id)) {
        throw new Error('That item is not purchasable.');
    }

    if(isNaN(amount) || amount < 1) {
        throw new Error('Invalid amount.');
    }

    if(!ItemUtil.canAfford(account.spoobux, id, amount)) {
        throw new Error('The user cannot afford this item.');
    }

    try {
        account = await removeSpoobux(account, ItemUtil.getItemCost(id, amount));
    } catch (e) {
        throw e;
    }

    return giveItem(account, id, amount, true);
}

// Amount of items required for tradeup
const TRADEUP_REQUIRED = 10;

/**
 * Trade up an item.
 * This requires 10 of the same item to be present in the user's inventory.
 * 10 items will be removed, and a random item of the next tier added.
 * @param account {object} - The account to use for the trade-up.
 * @param id {number} - The item ID to trade up to a better item.
 * @return {Promise.<*>}
 */
async function tradeUp(account, id) {
    if(!ItemUtil.itemExists(id)) {
        throw new Error('Item does not exist.');
    }

    if(ItemUtil.getItem(id).source !== ItemSource.CRATE) {
        throw new Error('Cannot trade up non-crate items.');
    }

    if(ItemUtil.getItem(id).rarity.equals(ItemRarity.MYTHICAL)) {
        throw new Error('Cannot trade up from this rarity.');
    }

    if(ItemUtil.getAccountItemAmount(account, id) < TRADEUP_REQUIRED) {
        throw new Error('Not enough items to trade up.');
    }

    // This can't throw  ¯\_(ツ)_/¯
    await giveItem(account, id, -TRADEUP_REQUIRED);

    const RarityValues = Object.values(ItemRarity);

    const nextRarity = RarityValues[RarityValues.indexOf(ItemUtil.getItem(id).rarity) + 1];

    // Get possible items using default settings in a crate.
    const possibleItems = new Crates.Crate().getItemsForRarity(nextRarity);

    const tradeupItem = Crates.Crate.getRandomItemFromItems(possibleItems);

    try {
        await giveItem(account, tradeupItem.id, 1, true);
    } catch (e) {
        throw e;
    }

    return tradeupItem;
}

module.exports = {
    saveAccount,
    createInventoryItem,
    giveItem,
    addSpoobux,
    removeSpoobux,
    incSpoobux,
    purchase,
    tradeUp
};