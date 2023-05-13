const mojang = require('mojang');
const MineplexSocket = require('../../lib/api/MineplexSocket');

function getRun(method = 'stalk', formatter = u => `Sent a request to stalk ${u}. You will be notified when they join.`) {
    return async function run(msg) {
        const name = msg.args[0];

        if (!name.isValidMinecraftName()) {
            return msg.reply('Hmm... that doesn\'t seem to be a valid Minecraft name. Try again?');
        }

        let uuid;
        try {
            uuid = (await mojang.user(name)).id.toUUID();
        } catch(e) {
            console.error(e);
            return msg.reply('Sorry, but I wasn\'t able to get that player\'s UUID. Try again later?');
        }

        MineplexSocket[method](uuid);

        return msg.reply(formatter(name));
    };
}

class StalkCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'stalk',
            auth: ['artix'],
            rankBypass: 'ADMIN',
            args: [{
                name: 'username',
                type: 'String',
                required: true
            }]
        });
    }

    async run(msg) {
        const name = msg.args[0];

        if (!name.isValidMinecraftName()) {
            return msg.reply('Hmm... that doesn\'t seem to be a valid Minecraft name. Try again?');
        }

        let uuid;
        try {
            uuid = (await mojang.user(name)).id.toUUID();
        } catch(e) {
            console.error(e);
            return msg.reply('Sorry, but I wasn\'t able to get that player\'s UUID. Try again later?');
        }

        MineplexSocket.once(`playerJoin-${uuid}`, region => {
            MineplexSocket.unstalk(uuid);
            msg.reply(`The player *${uuid}* has joined on *${region}`).catch(e => {
                console.error('Could not complete sending of a stalk notification:');
                console.error(e);
            });
        });

        MineplexSocket.stalk(uuid);

        return msg.reply(`Sent a request to stalk ${name}. You will be notified when they join.`);
    }
}

class UnstalkCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'unstalk',
            auth: ['artix'],
            rankBypass: 'ADMIN',
            args: [{
                name: 'username',
                type: 'String',
                required: true
            }]
        });
    }

    async run(msg) {
        const name = msg.args[0];

        if (!name.isValidMinecraftName()) {
            return msg.reply('Hmm... that doesn\'t seem to be a valid Minecraft name. Try again?');
        }

        let uuid;
        try {
            uuid = (await mojang.user(name)).id.toUUID();
        } catch(e) {
            console.error(e);
            return msg.reply('Sorry, but I wasn\'t able to get that player\'s UUID. Try again later?');
        }

        MineplexSocket.unstalk(uuid);

        return msg.reply(`Alright, sent a request to un-stalk *${uuid}*.`);
    }
}

module.exports = [
    StalkCommand,
    UnstalkCommand
];