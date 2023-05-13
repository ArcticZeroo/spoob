const COST = 100;
// 2 minutes
const COOLDOWN = 1000*30;

const Items = {
    CHERRY: 'cherries',
    APPLE: 'apple',
    COOKIE: 'cookie',
    PEACH: 'peach',
    MELON: 'melon',
    EGGPLANT: 'eggplant',
    LEMON: 'lemon',
    HAMBURGER: 'hamburger',
    DONUT: 'doughnut',
    PIZZA: 'pizza',
    CAKE: 'birthday',
    TOMATO: 'tomato',
    CRATE: 'package'
};

const Payout = {
    [Items.APPLE]: 11,
    [Items.CHERRY]: 14,
    [Items.COOKIE]: 18,
    [Items.EGGPLANT]: 22,
    [Items.DONUT]: 28,
    [Items.HAMBURGER]: 33,
    [Items.PEACH]: 41,
    [Items.MELON]: 200,
    [Items.PIZZA]: 225,
    [Items.CAKE]: 250,
    [Items.CRATE]: 30,
    // Just awards nothing :(
    [Items.TOMATO]: 0,
    // This one makes you win zero :(
    [Items.LEMON]: 0
};

const Weights = {
    [Items.APPLE]: 100,
    [Items.CHERRY]: 80,
    [Items.COOKIE]: 72,
    [Items.EGGPLANT]: 64,
    [Items.DONUT]: 56,
    [Items.HAMBURGER]: 48,
    [Items.PEACH]: 28,
    [Items.MELON]: 12,
    [Items.PIZZA]: 8,
    [Items.CAKE]: 3,
    [Items.CRATE]: 2,
    [Items.TOMATO]: 15,
    [Items.LEMON]: 8
};

let totalWeight = 0;

for (const item of Object.keys(Weights)) {
    totalWeight += Weights[item];
}

const Rarity = {};

let currentRarity = 0;

for(const item of Object.keys(Weights)){
    currentRarity += Weights[item] / totalWeight;
    Rarity[item] = currentRarity;
}

function getRandomItem() {
    const random = Math.random();

    const items = Object.keys(Rarity);

    for(const item of items) {
        const neededRarity = Rarity[item];

        if (neededRarity <= 0) continue;

        if (random <= neededRarity) {
            return item;
        }
    }

    return items[items.length - 1];
}

function getSlotItems() {
    return [getRandomItem(), getRandomItem(), getRandomItem()];
}

function getRawPayout(items = getSlotItems()) {
    let payout = 0;

    for (const item of items) {
        payout += Payout[item] || 0;
    }

    return payout;
}

function getPayout(items = getSlotItems()) {
    // Lemon = no points :(
    if (items.includes(Items.LEMON)) {
        return 0;
    }

    // 3 multiplier for all the same item
    if (items[0] === items[1] && items[0] === items[2]) {
        return Math.floor((Payout[items[0]] * 3) * 3);
    }

    // 1.75 multiplier for 2 same
    function twoOfAKind() {
        return Math.floor(getRawPayout(items) * 1.75);
    }

    if (items[0] === items[1]) {
        return twoOfAKind(items[0], items[2]);
    } else if (items[1] === items[2]) {
        return twoOfAKind(items[1], items[0]);
    }

    return getRawPayout(items);
}

const header = `:white_small_square: :white_small_square: :rotating_light: :white_small_square: :white_small_square:
:black_medium_square: :black_medium_square: :black_medium_square: :black_medium_square: :black_medium_square:
:black_medium_square: :robot_face: :game_die: :money_with_wings: :black_medium_square:       :red_circle: 
:black_medium_square: :black_medium_square: :black_medium_square: :black_medium_square: :black_medium_square: :heavy_check_mark: 
:white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square:
:white_large_square: :white_small_square: :white_small_square: :white_small_square: :white_large_square:`.split('\n');
const side = ':white_large_square:';
const footer = `:white_large_square: :white_small_square: :white_small_square: :white_small_square: :white_large_square:
:white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square:`.split('\n');

function createSlotDisplay(items = getSlotItems()) {
    const rows = [];

    rows.push(...header);

    rows.push(`${side} :${items[0]}: :${items[1]}: :${items[2]}: ${side}`);

    rows.push(...footer);

    return rows.join('\n');
}

module.exports = {
    Items,
    Payout,
    createSlotDisplay,
    getSlotItems,
    getRandomItem,
    getRawPayout,
    getPayout,
    COST,
    COOLDOWN
};