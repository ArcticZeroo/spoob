const { sendMessage } = require('../../services/inappropriate-names');
const { words } = require('../../../config/index');

const replaceMap = {
    4: 'a',
    3: 'e',
    6: 'd',
    1: 'i',
    0: 'o',
    5: 's',
    7: 't',
    '_': ''
};

const replaceRegex = {};

for (const char of Object.keys(replaceMap)) {
    replaceRegex[char] = new RegExp(`/${char}/g`);
}

function isInappropriate(name){
    name = name.toLowerCase();

    // Replace leet
    for (const char of Object.keys(replaceMap)) {
        name = name.replace(replaceRegex[char], replaceMap[char]);
    }

    // Check for inappropriate words
    for (const word of words) {
        if (name.includes(word)) {
            return word;
        }
    }

    // If none, we consider it appropriate
    return false;
}

function incoming(name) {
    const word = isInappropriate(name);

    if (!word) {
        return;
    }

    sendMessage(name, `(Word: \`${word}\`)`).catch(e => {
        if ((e.message || e || '').includes('been reported')) {
            return;
        }

        console.error(`Could not send an inappropriate name message for ${name}:`);
        console.error(e);
    });
}

module.exports = { incoming };