const ItemType = require('./enum/ItemType');
const ItemRarity = require('./enum/ItemRarity');
const ItemSource = require('./enum/ItemSource');
const ItemEdition = require('./enum/ItemEdition');

module.exports = {
    1: {
        id: 1,
        name: 'Spoob-A-Cola',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        extra: 'Thirsty? Don\'t be! Drink a Spooba Cola today to solve all your problems!',
        rarity: ItemRarity.COMMON
    },
    2: {
        id: 2,
        name: 'Cookie',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        extra: 'Send your taste buds on a journey with this delectable treat!',
        rarity: ItemRarity.COMMON
    },
    3: {
        id: 3,
        name: 'Spoobox',
        type: 'crate',
        source: ItemSource.SHOP,
        price: 1000,
        description: '???',
        class: 'Spoobox'
    },
    4: {
        name: '200 Spoobux',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.SPOOBUX,
        amount: 200,
        rarity: ItemRarity.COMMON
    },
    5: {
        name: '500 Spoobux',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.SPOOBUX,
        amount: 500,
        rarity: ItemRarity.RARE
    },
    6: {
        name: '850 Spoobux',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.SPOOBUX,
        amount: 850,
        rarity: ItemRarity.EPIC
    },
    7: {
        name: '1500 Spoobux',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.SPOOBUX,
        amount: 1500,
        rarity: ItemRarity.LEGENDARY
    },
    8: {
        name: 'Generic Bottlecap',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.COMMON
    },
    9: {
        name: 'Generic Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.COMMON
    },
    10: {
        name: 'GWEN Mascot Poster',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.COMMON
    },
    11: {
        name: 'Golden Star',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.COMMON
    },
    12: {
        name: 'Penguin Poster',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.COMMON
    },
    13: {
        name: 'Spoobncoobr Fan T-Shirt',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.COMMON
    },
    14: {
        name: 'Spoobncoobr Poster',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.COMMON
    },
    15: {
        name: 'Mineplex DEV Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.RARE
    },
    16: {
        name: 'Mineplex TRAINEE Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.RARE
    },
    17: {
        name: 'Mineplex MOD Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.RARE
    },
    18: {
        name: 'Mineplex SR.MOD Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.RARE
    },
    19: {
        name: 'Penguin Awareness Poster',
        extra: '#FreeThePenguins',
        edition: ItemEdition.NONE,
        source: ItemSource.CRATE,
        type: ItemType.ITEM,
        rarity: ItemRarity.RARE
    },
    20: {
        name: 'Penguin Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.RARE
    },
    21: {
        name: 'Shiny Spoob-A-Cola Bottlecap',
        extra: 'Keeps Radroaches away!',
        edition: ItemEdition.NONE,
        source: ItemSource.CRATE,
        type: ItemType.ITEM,
        rarity: ItemRarity.RARE
    },
    22: {
        name: 'Shiny Penguin Sticker',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.RARE
    },
    23: {
        name: 'Super PenguinMan Poster',
        extra: 'It\'s a fish! It\'s a seal! No, it\'s a bird!',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.RARE
    },
    24: {
        name: 'GWEN Ban Animation Poster',
        extra: 'You get a ban! You get a ban! EVERYONE gets a ban!',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.RARE
    },
    25: {
        name: 'Artix Plushy',
        extra: 'So cute!',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.EPIC
    },
    26: {
        name: 'Carl The Creeper Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.EPIC
    },
    27: {
        name: 'Purple Penguin Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.EPIC
    },
    28: {
        name: 'Red Penguin Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.EPIC
    },
    29: {
        name: 'Blue Penguin Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.EPIC
    },
    30: {
        name: 'Pink Penguin Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.EPIC
    },
    31: {
        name: 'Green Penguin Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.EPIC
    },
    32: {
        name: 'Fancy Penguin Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.EPIC
    },
    33: {
        name: 'Fancy Spoobncoobr Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.EPIC
    },
    34: {
        name: 'AlexTheCoder Trading Card',
        extra: 'You might want to get rid of this one...',
        image: 'http://i.imgur.com/vSAIrQK.jpg',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    35: {
        name: 'Artix Trading Card',
        extra: 'Penguins are cool I guess...',
        image: 'http://i.imgur.com/aMThOvU.jpg',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    36: {
        name: 'BlueBeetleHD Trading Card',
        extra: 'Eeyore is a donkey not a blue cow',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    37: {
        name: 'Carl The Creeper Trading Card',
        extra: 'Don\'t drop it!',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    38: {
        name: 'Diar Trading Card',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    39: {
        name: 'GWEN Trading Card',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    40: {
        name: 'Jarvis Trading Card',
        extra: 'Just A Rather Very Intelligent System',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    41: {
        name: 'Relyh Trading Card',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    42: {
        name: 'SamitoD Trading Card',
        extra: 'Smells like turtle stew.',
        image: 'http://i.imgur.com/UhGrGYI.jpg',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    43: {
        name: 'ShinyRukii Trading Card',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    44: {
        name: 'Sigils Trading Card',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    45: {
        name: 'Spoobncoobr Trading Card',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    46: {
        name: 'Super PenguinMan Trading Card',
        extra: 'It\'s a fish! It\'s a seal! No, it\'s a bird!',
        image: 'http://i.imgur.com/HIuhude.jpg',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    47: {
        name: 't3hero Trading Card',
        extra: 'I wave my hands around and yell at people.',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    48: {
        name: 'WebGlitch Trading Card',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    49: {
        name: 'Pirate Penguin Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.LEGENDARY
    },
    50: {
        name: 'Slimy Penguin Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.LEGENDARY
    },
    51: {
        name: 'Ninja Penguin Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.LEGENDARY
    },
    52: {
        name: 'Captain Spoobncoobr Pirate Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.LEGENDARY
    },
    53: {
        name: 'Sterling_ Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.LEGENDARY
    },
    54: {
        id: 54,
        name: 'Chiss Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.LEGENDARY
    },
    55: {
        id: 55,
        name: 'Defek7 Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.LEGENDARY
    },
    56: {
        name: 'Holographic AlexTheCoder Trading Card',
        extra: 'You might want to get rid of this one...',
        image: 'http://i.imgur.com/vtjLEMT.jpg',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    57: {
        name: 'Holographic Artix Trading Card',
        extra: 'Penguins are cool I guess...',
        image: 'http://i.imgur.com/H3TQtnW.jpg',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    58: {
        name: 'Holographic BlueBeetleHD Trading Card',
        extra: 'Eeyore is a donkey not a blue cow',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    59: {
        name: 'Holographic Carl The Creeper Trading Card',
        extra: 'Don\'t drop it!',
        edition: ItemEdition.NONE,
        source: ItemSource.CRATE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    60: {
        name: 'Holographic Diar Trading Card',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    61: {
        name: 'Holographic GWEN Trading Card',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    62: {
        name: 'Holographic Jarvis Trading Card',
        extra: 'Just A Rather Very Intelligent System',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    63: {
        name: 'Holographic Relyh Trading Card',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    64: {
        name: 'Holographic SamitoD Trading Card',
        extra: 'Smells like turtle stew.',
        image: 'http://i.imgur.com/gryhIiE.jpg',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    65: {
        name: 'Holographic ShinyRukii Trading Card',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    66: {
        name: 'Holographic Sigils Trading Card',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    67: {
        name: 'Holographic Spoobncoobr Trading Card',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    68: {
        name: 'Holographic Super PenguinMan Trading Card',
        extra: 'It\'s a fish! It\'s a seal! No, it\'s a bird!',
        image: 'http://i.imgur.com/JdFotY7.jpg',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    69: {
        name: 'First Edition Spoobncoobr Plushy',
        extra: 'Mint Condition!',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.MYTHICAL
    },
    70: {
        name: 'Autographed Holographic Spoobncoobr Trading Card',
        extra: 'Mint Condition!',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.MYTHICAL
    },
    71: {
        name: 'Autographed Holographic Super PenguinMan Trading Card',
        extra: 'It\'s a fish! It\'s a seal! No, it\'s a bird!',
        image: 'http://i.imgur.com/09U9iLX.jpg',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.MYTHICAL
    },
    72: {
        name: 'Create-A-Card',
        extra: 'Bug Artix about this to crate a new trading card! (Holographic + Regular Included)',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: 'create',
        rarity: ItemRarity.MYTHICAL
    },
    73: {
        name: 'TaylorTheCoder Trading Card',
        extra: 'We ship it.',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    74: {
        name: 'Holographic TaylorTheCoder Trading Card',
        extra: 'We ship it.',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    75: {
        name: 'SamitinaD Trading Card',
        extra: 'She looks beautiful!',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    76: {
        name: 'Holographic SamitinaD Trading Card',
        extra: 'She looks beautiful!',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    77: {
        name: 'BCL Finals Ticket',
        extra: 'Do you love the BCL?',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.COMMON
    },
    78: {
        name: 'Create-An-Item',
        extra: 'Like QA, but not! (Non-Cards only, weight determined by Artix)',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: 'create',
        rarity: ItemRarity.MYTHICAL
    },
    79: {
        name: 'Artix BobbleHead',
        extra: 'Boing goes the penguin!',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.RARE
    },
    80: {
        name: 'Tortelett Trading Card',
        extra: 'Why did I agree to make all these trading cards?',
        image: 'http://i.imgur.com/mkX3hah.jpg',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    81: {
        name: 'Holographic Tortelett Trading Card',
        extra: 'Why did I agree to make all these trading cards?',
        image: 'http://i.imgur.com/cSXffcK.jpg',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    82: {
        name: 'Bread',
        extra: 'Crunchy!',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.COMMON
    },
    83: {
        name: 'Wanderer Trading Card',
        extra: 'Is this redeemable for free art?',
        image: 'http://i.imgur.com/EhuA9Wz.jpg',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    84: {
        name: 'Holographic Wanderer Trading Card',
        extra: 'Is this redeemable for free art?',
        image: 'http://i.imgur.com/ItWgQoz.jpg',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    85: {
        name: 'Vintage Spoob-A-Cola Bottle',
        extra: 'Tastes like food poisoning!',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.RARE
    },
    86: {
        name: 'Foam GWEN BanHammer',
        extra: 'Go hit someone with it!',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.COMMON
    },
    87: {
        name: 'Penguin BobbleHead',
        extra: 'Boing, boing boing...',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.COMMON
    },
    88: {
        name: 'Super PenguinMan BobbleHead',
        extra: 'Boing, boing boing...',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.RARE
    },
    89: {
        name: 'Chiss BobbleHead',
        extra: 'Did that BobbleHead just meow at me?',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.EPIC
    },
    90: {
        name: 'Defek7 BobbleHead',
        extra: 'He\'s watching me...',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.EPIC
    },
    91: {
        name: 'Sterling_ BobbleHead',
        extra: 'Boing, boing boing...',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.EPIC
    },
    92: {
        name: 'Tie-Dye Spoobncoobr Fan T-Shirt',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.RARE
    },
    93: {
        name: 'Ancient Spoobncoobr Drachma',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.RARE
    },
    94: {
        name: 'Ancient Golden Spoobncoobr Statue',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.LEGENDARY
    },
    95: {
        name: 'Useless Item',
        source: ItemSource.SHOP,
        type: ItemType.ITEM,
        price: 10
    },
    96: {
        name: 'Holographic t3hero Trading Card',
        extra: 'I wave my hands around and yell at people.',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    97: {
        name: 'Holographic WebGlitch Trading Card',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    98: {
        name: 'Toki the Taco Trading Card',
        extra: 'The card owner is a smelly nub who likes tacos.',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    99: {
        name: 'Holographic Toki the Taco Trading Card',
        extra: 'The card owner is a smelly nub who likes tacos.',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    100: {
        name: 'Spookbox',
        description: 'spooky!',
        restricted: ['Artix', 'Relyh'],
        price: 1500,
        source: ItemSource.SHOP,
        edition: 'halloween-2016',
        type: 'crate'
    },
    101: {
        name: 'Life-Size Cardboard Sigils Cutout',
        extra: 'Can I get a :sigils: in the chat?',
        image: 'i.imgur.com/M57fF3a.png',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.ITEM,
        rarity: ItemRarity.EPIC
    },
    102: {
        name: 'LeAragog Trading Card',
        extra: 'King of the spiders!',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    103: {
        name: 'Holographic LeAragog Trading Card',
        extra: 'King of the spiders!',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    104: {
        name: 'Swimmer_ Trading Card',
        extra: 'Hi I\'m Swimmer',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    105: {
        name: 'Holographic Swimmer_ Trading Card',
        extra: 'Hi I\'m Swimmer',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    107: {
        name: 'Cosmic\'s Rocket Blastoff Trading Card',
        extra: 'Time for an adventure that\'s out of this world!',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.EPIC
    },
    108: {
        name: 'Holographic Cosmic\'s Rocket Blastoff Trading Card',
        extra: 'Time for an adventure that\'s out of this world!',
        source: ItemSource.CRATE,
        edition: ItemEdition.NONE,
        type: ItemType.CARD,
        rarity: ItemRarity.LEGENDARY
    },
    109:{
        name: 'Lovebox',
        source: ItemSource.SHOP,
        type: ItemType.CRATE,
        price: 2000,
        description: '<3',
        class: 'Lovebox'
    },
    // Valentines 2017 Items
    110: {
        name: 'Heart Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.RARE,
    },
    111: {
        name: 'Heart Candies',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.COMMON,
    },
    112: {
        name: 'Heart Glasses',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.RARE,
    },
    113: {
        name: 'Heart Chocolates',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.COMMON,
    },
    114: {
        name: 'Chocolate Bar',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.COMMON,
    },
    115: {
        name: 'Spoob Candies',
        extra: 'Tastes fishy...',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.RARE,
    },
    116: {
        name: 'Rose',
        extra: 'How romantic!',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.RARE,
    },
    117: {
        name: 'Coupon For Free Dinner For Two',
        extra: '*Included with the purchase of two $20 meals',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.EPIC,
    },
    118: {
        name: 'Puppy Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.RARE,
    },
    119: {
        name: 'Candles',
        extra: 'Now, if only I had a free dinner for two...',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.RARE,
    },
    120: {
        name: 'Box of Chocolates',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.RARE,
    },
    121: {
        name: 'Bouquet of Roses',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.EPIC,
    },
    122: {
        name: 'Cupid Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.RARE,
    },
    123: {
        name: 'Cupid\'s Bow and Arrow',
        extra: 'You only get one shot!',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.EPIC,
    },
    124: {
        name: 'Dove Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.RARE,
    },
    125: {
        name: 'Love Birds Plushy',
        extra: 'Aww look, they\'re kissing!',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.EPIC,
    },
    126: {
        name: 'Cupid\'s Wings',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.EPIC,
    },
    127: {
        name: 'Cheap Love Note',
        extra: 'I think the paper it\'s written on is soggy...',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.COMMON,
    },
    128: {
        name: 'Moderately-Priced Love Note',
        extra: 'It\'s flimsy, but at least it\'s dry.',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.RARE,
    },
    129: {
        name: 'Overpriced Love Note',
        extra: 'Wow! Cardstock',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.EPIC,
    },
    130: {
        name: 'Fancy Love Note',
        extra: 'This card must have cost thousands of dollars!',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.LEGENDARY,
    },
    131: {
        name: 'Plastic Necklace',
        extra: 'Meh. I\'ve seen better on circus monkeys.',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.COMMON,
    },
    132: {
        name: 'Metallic Necklace',
        extra: 'At least this won\'t melt when it gets warm, but I\'m pretty sure it\'s made of paperclips.',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.RARE,
    },
    133: {
        name: 'Silver Necklace',
        extra: 'How thoughtful.',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.EPIC,
    },
    134: {
        name: 'Diamond Necklace',
        extra: 'Sparkly!',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.LEGENDARY,
    },
    135: {
        name: 'Charm Bracelet',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.RARE,
    },
    136: {
        name: 'Love Potion',
        extra: 'Be careful!',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.EPIC,
    },
    137: {
        name: 'Yellow Rose',
        extra: 'Friend-zoned.',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.RARE,
    },
    138: {
        name: 'Angel Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.RARE,
    },
    139: {
        name: 'Romantic Poem',
        extra: 'Ugh. Gag me.',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.RARE,
    },
    140: {
        name: 'Hershey\'s Kiss',
        extra: 'Hey there, wanna kiss?',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.ITEM,
        rarity: ItemRarity.COMMON,
    },
    141:{
        name: 'Spoobncoobette Plushy',
        source: ItemSource.CRATE,
        edition: ItemEdition.VALENTINES_2017,
        type: ItemType.PLUSHY,
        rarity: ItemRarity.LEGENDARY
    },
    // End valentines 2017 items
    142: {
        id: 142,
        name: 'Super Spoobox',
        type: 'crate',
        source: ItemSource.EVENT,
        price: 3000,
        description: 'No commons, but only 1 item!',
        class: 'SuperSpoobox'
    },
    143: {
        id: 143,
        name: 'Crazy Spoobox',
        type: 'crate',
        source: ItemSource.EVENT,
        price: 6000,
        description: 'No commons, less rares, but only 1 item!',
        class: 'CrazySpoobox'
    },
};