const id = require('../../../util/id');

function countStars(str) {
    let count = 0;

    for (let i = 0; i < str.length; i++) {
        if (str.charAt(i) === '*') {
            count++;
        }
    }

    return count;
}

const MESSAGE_TIMEOUT = 10*1000;

function testFilter(client, text) {
    return new Promise((resolve, reject) => {
        text = text.trim();

        const startStars = countStars(text);

        const nonce = id.generateId();

        const event = `mineplex-filter-test-response-${nonce}`;

        if (client.listenerCount(event) > 0) {
            return testFilter(client, text);
        }

        // Send the message, and then once it's sent start the timeout
        // if the message fails to send, reject obviously.
        client.send(`/m Spoobncoobr FT|${nonce} ${text}`).then(() => {
            const timeout = setTimeout(() => {
                client.removeAllListeners(event);
                reject('Filter test timed out.');
            }, MESSAGE_TIMEOUT);

            client.once(event, response => {
                clearTimeout(timeout);

                const endStars = countStars(response);

                resolve({ response, startStars, endStars, isFiltered: endStars !== startStars });
            });
        }).catch(e => {
            reject(e);
        });
    });
}

module.exports = function handleFilterTesting(client) {
    client.on('private-message', function (msg) {
        if (msg.sender === client.bot.username && msg.target === client.bot.username && msg.text.includes('FT|')) {
            // get the first word before a space after the • character
            const split = msg.text.split('|')[1].split(' ');
            const id = split.shift();
            const response = split.join(' ');

            client.emit(`mineplex-filter-test-response-${id}`, response);
        }
    });

    client.mineplex.filter = {
        test: text => testFilter(client, text)
    };
};