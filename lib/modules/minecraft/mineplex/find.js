const { StringUtil } = require('iron-golem');

// 10 seconds to timeout
const FIND_TIMEOUT = 10*1000;
const FIND_REGEX = /^(?:Located )?\[\s*(.{1,16})\s*] (?:at (.+)|is in the same server!)$/;
const NO_FIND_REGEX = /^Failed to locate \[\s*(.{1,16})\s*]\.$/;

function find(client, player) {
    return new Promise((resolve, reject) => {
        player = player.toLowerCase().trim();

        if (!StringUtil.isValidMinecraftName(player)) {
            reject('Invalid player name.');
            return;
        }

        const event = `mineplex-locate-response-${player}`;

        if (client.listenerCount(event) > 0) {
            reject('Someone else is waiting to find this player.');
            return;
        }

        // Send the message, and then once it's sent start the timeout
        // if the message fails to send, reject obviously.
        client.send(`/find ${player}`).then(() => {
            const timeout = setTimeout(() => {
                client.removeAllListeners(event);
                reject('Find timed out.');
            }, FIND_TIMEOUT);

            client.once(event, (isOnline, server) => {
                clearTimeout(timeout);

                resolve({ isOnline, server });
            });
        }).catch(e => {
            reject(e);
        });
    });
}

module.exports = function injectFind (client) {
    client.on('mineplex-locate', msg => {
        function emit(player, isOnline, server) {
            player = player.toLowerCase().trim();

            client.emit('mineplex-locate-response', player, isOnline, server);
            client.emit(`mineplex-locate-response-${player}`, isOnline, server);
        }

        const findMatch = FIND_REGEX.exec(msg.text);

        if (findMatch) {
            const player = findMatch[1];

            let server = findMatch[2];

            if (!server) {
                // If there's no server, it's the current one.
                server = client.mineplex.server.current;
            }

            // Emit it, obviously
            emit(player, true, server);
            return;
        }

        const noFindMatch = NO_FIND_REGEX.exec(msg.text);

        if (noFindMatch) {
            const player = noFindMatch[1];

            emit(player, false);
        }
    });

    client.mineplex.find = player => find(client, player);
};

module.exports.multiRegion = async function (clients, player) {
    for (const region of Object.keys(clients)) {
        try {
            const { isOnline, server } = await clients[region].mineplex.find(player);

            if (isOnline) {
                return { isOnline, server, region };
            }
        } catch (e) {
            throw e;
        }
    }

    return { isOnline: false };
};