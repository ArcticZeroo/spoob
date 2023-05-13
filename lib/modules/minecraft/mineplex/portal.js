const STAY_CONFIG = require('../../../../config/minecraft').stay;
const CURRENT_SERVER_REGEX = /^You are currently on server: (.+)$/;

module.exports = function (client) {
    client.mineplex.server = {};

    client.mineplex.server.current = 'Unknown';

    client.on('mineplex-portal', function (msg) {
        const match = CURRENT_SERVER_REGEX.exec(msg.text);

        if (match) {
            client.mineplex.server.current = match[1];
            client.emit('current-server', match[1]);
        }
    });

    client.on('current-server', function (server) {
        if (server !== STAY_CONFIG.server) {
            client.send(`/server ${STAY_CONFIG.server}`).catch(console.error);
        }
    });

    client.once('login', function () {
        setInterval(() => {
            // query the current server...
            client.send('/server').catch(console.error);
        }, STAY_CONFIG.interval);
    });

    client.on('spawn', function () {
        client.send('/server').catch(console.error);
    });
};