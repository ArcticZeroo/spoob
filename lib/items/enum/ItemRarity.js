class ItemRarity{
    constructor(name, color, weight){
        this.name   = name;
        this.color  = color;
        this.weight = weight;
        this.rarity = 0;
    }

    equals(rarity){
        return rarity.name == this.name;
    }
}

module.exports = {
    COMMON: new ItemRarity('Common', '#607D8B', 625),
    RARE: new ItemRarity('Rare', '#6200EA', 375),
    EPIC: new ItemRarity('Epic', '#00B0FF', 35),
    LEGENDARY: new ItemRarity('Legendary', '#76FF03', 12),
    MYTHICAL: new ItemRarity('Mythical', '#D50000', 4)
};