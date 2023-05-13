const config = require('../../../../config/minecraft');

const TELEPORT_TO_PLAYER_REGEX = /^(.+?)\s+teleported you to (.+)\s*./;

module.exports = function undoTeleports(client) {
    client.mineplex.teleport = function (a, b) {
        let cmd = `/tp ${a}`;

        if (b) {
            cmd += ` ${b}`;
        }

        return client.chat(cmd);
    };

    client.mineplex.teleportHere = function (target) {
        return client.chat(`/tp here ${target}`);
    };

    client.mineplex.teleportUndo = client.mineplex.teleportBack = function (target, count) {
        let cmd = '/tp b';

        if (target.toLowerCase() !== client.username.toLowerCase()) {
            cmd += ` ${target}`;
        }

        if (count) {
            cmd += ` ${count}`;
        }

        return client.chat(cmd);
    };

    client.on('mineplex-teleport', msg => {
        if (!TELEPORT_TO_PLAYER_REGEX.test(msg.text)) {
            return;
        }

        //TODO: Handling for this player. Will do once I test that this works to begin with
        const teleporter = TELEPORT_TO_PLAYER_REGEX.exec(msg.text)[1].toLowerCase();

        if (config.permitted.includes(teleporter))
        {
            return;
        }

        client.mineplex.teleportBack()
            .catch(console.error);
    });
};