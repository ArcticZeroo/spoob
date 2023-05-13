// 10 seconds to timeout
const RESTART_TIMEOUT = 10*1000;
const RESTART_REGEX = /^Sent restart command to\s+([A-Za-z\-0-9]+)\s*\.$/;
const RESTART_NO_EXIST_REGEX = /^\s*([A-Za-z\-0-9]+)\s+doesn't exist\s*\.$/;

function restart(client, server) {
    return new Promise((resolve, reject) => {
        server = server.trim();

        const event = `mineplex-restart-response-${server}`;

        if (client.listenerCount(event) > 0) {
            reject('Someone else is waiting to restart this server.');
            return;
        }

        // Send the message, and then once it's sent start the timeout
        // if the message fails to send, reject obviously.
        client.send(`/restart ${server}`).then(() => {
            const timeout = setTimeout(() => {
                client.removeAllListeners(event);
                reject('Restart timed out.');
            }, RESTART_TIMEOUT);

            client.once(event, exists => {
                clearTimeout(timeout);

                if (!exists) {
                    reject('Server does not exist.');
                    return;
                }

                resolve();
            });
        }).catch(e => {
            reject(e);
        });
    });
}

module.exports = function (client) {
    client.on('mineplex-restart', msg => {
        function emit(server, exists = true) {
            server = server.trim();

            client.emit('mineplex-restart-response', server, exists);
            client.emit(`mineplex-restart-response-${server}`, exists);
        }

        const restartMatch = RESTART_REGEX.exec(msg.text);

        if (restartMatch) {
            const server = restartMatch[1];

            // Emit it, obviously
            emit(server);
            return;
        }

        const noRestartMatch = RESTART_NO_EXIST_REGEX.exec(msg.text);

        if (noRestartMatch) {
            const server = noRestartMatch[1];

            emit(server, false);
        }
    });

    client.mineplex.restart = server => restart(client, server);
};