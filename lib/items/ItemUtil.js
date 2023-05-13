const ItemType    = require('./enum/ItemType');
const ItemRarity  = require('./enum/ItemRarity');
const ItemSource  = require('./enum/ItemSource');
const ItemEdition = require('./enum/ItemEdition');
const items       = require('./ItemList');

class ItemUtil{
    static itemExists(id){
        return (items.hasOwnProperty(id));
    }

    static getItems(){
        return items;
    }

    static getItem(id){
        return (items[id]);
    }

    static isPurchasable(id){
        if(!this.itemExists(id)) return false;

        const item = this.getItem(id);
        return (item.source == ItemSource.SHOP && item.price);
    }

    static isOpenable(id){
        if(!this.itemExists(id)) return false;

        const item = this.getItem(id);
        return (item.type == ItemType.CRATE);
    }

    static getItemCost(id, amount = 1){
        if(this.isPurchasable(id)){
            return items[id].price * amount;
        }

        return 0;
    }

    static canAfford(spoobux, id, amount){
        return (spoobux >= ItemUtil.getItemCost(id, amount));
    }

    static getAccountItem(account, id){
        return account.inventory[id];
    }

    static getAccountItemAmount(account, id){
        const item = ItemUtil.getAccountItem(account, id);
        if(!item || !item.amount) return 0;
        return item.amount;
    }
}

module.exports = ItemUtil;