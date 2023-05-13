const ItemUtil   = require('./ItemUtil');
const ItemEdition = require('./enum/ItemEdition');
const ItemSource = require('./enum/ItemSource');
const ItemType = require('./enum/ItemType');
const ItemRarity = require('./enum/ItemRarity');
const Transactions = require('./transactions');

Object.filter = (obj, predicate) => {
    const result = {};

    for(const key of Object.keys(obj)){
        if(obj.hasOwnProperty(key) && predicate(obj[key])){
            result[key] = obj[key];
        }
    }

    return result;
};

const crateItems = Object.filter(ItemUtil.getItems(), item => {return item.source == ItemSource.CRATE;});

class Crate{
    constructor(edition = ItemEdition.NONE){
        this.loot_count = 2;
        this.edition    = edition;
        this.items      = Object.filter(crateItems, val => {return val.edition == this.edition;});
        this.rarities   = Object.assign({}, ItemRarity);
    }

    static getRandomRarity(rarities){
        const random = Math.random();

        const rarityNames = Object.keys(rarities);

        for(const rarityName of rarityNames){
            const rarity = rarities[rarityName].rarity;

            if(rarity <= 0) continue;

            if(random <= rarity){
                return rarities[rarityName];
            }
        }

        return rarities[rarityNames[rarityNames.length - 1]];
    }

    getItemsForRarity(rarity){
        return Object.filter(this.items, item => {return item.rarity && item.rarity.equals(rarity);});
    }

    static getRandomItemFromItems(possibleItems){
        const randomId = Object.keys(possibleItems)[Math.floor(Math.random() * Object.keys(possibleItems).length)];

        const randomItem = possibleItems[randomId];

        //In case I forgot to put an ID since I am dumb.
        randomItem.id = randomId;

        return randomItem;
    }

    computeRarities(){
        const totalWeight = Object.keys(this.rarities).reduce((sum,key) => {return sum + this.rarities[key].weight;}, 0);

        let currentRarity = 0;
        for(const rarityName of Object.keys(this.rarities)){
            currentRarity += this.rarities[rarityName].weight / totalWeight;
            this.rarities[rarityName].rarity = currentRarity;
        }
    }

    getRandomItem(){
        const randomRarity  = Crate.getRandomRarity(this.rarities);

        const possibleItems = this.getItemsForRarity(randomRarity);

        return Crate.getRandomItemFromItems(possibleItems);
    }

    open(account, callback){
        try{
            const loot = [];

            for(let i = 0; i < this.loot_count; i++){
                const item = this.getRandomItem();
                loot.push(item);

                if(item.type == ItemType.SPOOBUX){
                    Transactions.addSpoobux(account, item.amount, false);
                }else{
                    Transactions.giveItem(account, item.id, 1, false);
                }
            }

            Transactions.saveAccount(account, err => {
                if(err) return callback(err);
                callback(null, loot);
            });
        }catch(e){
            callback(e);
        }
    }
}

class Spoobox extends Crate{
    constructor(){
        super();
        this.computeRarities();
    }
}

class Lovebox extends Crate{
    constructor(){
        super(ItemEdition.VALENTINES_2017);

        this.rarities.COMMON.weight = 500;
        this.rarities.RARE.weight = 300;
        this.rarities.EPIC.weight = 60;
        this.rarities.LEGENDARY.weight = 15;
        this.rarities.MYTHICAL.weight = 0;

        this.computeRarities();
    }
}

class SuperSpoobox extends Crate {
    constructor() {
        super();
        this.rarities.COMMON.weight = 0;
        this.loot_count = 1;

        this.computeRarities();
    }
}

class CrazySpoobox extends Crate {
    constructor() {
        super();
        this.rarities.COMMON.weight = 0;
        this.rarities.RARE.weight /= 1.7;

        this.computeRarities();
    }
}

module.exports = {
    Crate,
    Spoobox,
    Lovebox,
    SuperSpoobox,
    CrazySpoobox
};