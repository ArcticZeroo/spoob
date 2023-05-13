const { StringUtil } = require('iron-golem');

// 10 seconds to timeout
const FIND_TIMEOUT = 10*1000;
const TIME_REGEX = /^(.{1,16})\s+has spent\s+([\d.]+\s*\w+)\s+in game$/;
const NOT_FOUND_REGEX = /^Player\s+(.{1,16})\s+not found!$/;

function checkTime(client, player) {
    return new Promise((resolve, reject) => {
        player = player.toLowerCase().trim();

        if (!StringUtil.isValidMinecraftName(player)) {
            reject('Invalid player name.');
            return;
        }

        const event = `mineplex-time-response-${player}`;

        if (client.listenerCount(event) > 0) {
            reject('Someone else is waiting to find this player.');
            return;
        }

        // Send the message, and then once it's sent start the timeout
        // if the message fails to send, reject obviously.
        client.send(`/time ${player}`).then(() => {
            const timeout = setTimeout(() => {
                client.removeAllListeners(event);
                reject('time command timed out.');
            }, FIND_TIMEOUT);

            client.once(event, (exists, time) => {
                clearTimeout(timeout);

                if (!exists) {
                    reject('Player does not exist.');
                }

                resolve({ time });
            });
        }).catch(e => {
            reject(e);
        });
    });
}

module.exports = function injectTime (client) {
    client.on('mineplex-time', msg => {
        function emit(player, exists, time) {
            player = player.toLowerCase().trim();

            client.emit('mineplex-time-response', player, exists, time);
            client.emit(`mineplex-time-response-${player}`, exists, time);
        }

        const timeMatch = TIME_REGEX.exec(msg.text);

        if (timeMatch) {
            const player = timeMatch[1];

            const time = timeMatch[2];

            // Emit it, obviously
            emit(player, true, time);
            return;
        }

        const noFindMatch = NOT_FOUND_REGEX.exec(msg.text);

        if (noFindMatch) {
            const player = noFindMatch[1];

            emit(player, false);
        }
    });

    client.mineplex.time = player => checkTime(client, player);
};