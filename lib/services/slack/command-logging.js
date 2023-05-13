const { disallowed } = require('../../../config/disguises');

module.exports = function (MineplexSocket, slackBots) {
    // Log use of /find
    MineplexSocket.on('findCommand', data => {
        if (data.admin.uuid === data.target.uuid) return;
        slackBots.MP.chat('pc-command-logging', `*${data.admin.name}* attempted to locate *${data.target.name}* on *${data.server}*\nAdmin UUID: \`${data.admin.uuid}\``);
    });

    // Log use of /disguise, including failures.
    MineplexSocket.on('disguiseCommand', data => {
        let disguiseMessageVerb = 'disguised';

        function disguiseFail(reason) {
            disguiseMessageVerb = `attempted to disguise (*${reason}*)`;
        }

        for (const restriction of disallowed) {
            const val = data.target[restriction.field];
            if (val && restriction.matches.includes(val.toLowerCase())) {
                disguiseFail(restriction.reason);
                break;
            }

            if (restriction.matches.includes(data.skin.toLowerCase())) {
                disguiseFail(`${restriction.reason} [Skin]`);
                break;
            }
        }

        slackBots.MP.chat('pc-disguise-logging', `*${data.admin.name}* ${disguiseMessageVerb} as *${data.target.name}* (Skin: ${data.skin}) | *${data.region} ${data.server}*`);
    });

    MineplexSocket.on('undisguiseCommand', data => {
        slackBots.MP.chat('pc-disguise-logging', `*${data.admin.name}* is no longer disguised as *${data.target.name}*`);
    });

    // Log use of event commands
    MineplexSocket.on('eventCommand', () => {
        slackBots.MP.chat('pc-event-logging', 'ヽ༼ຈل͜ຈ༽ﾉ');
    });
};