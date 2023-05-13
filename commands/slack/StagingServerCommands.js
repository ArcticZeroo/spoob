const MineplexSocket = require('../../lib/api/MineplexSocket');
const nonceGen = require('../../lib/util/id');

function getRun(createMethod = 'createServer', createName = 'start') {
    return async function run(msg, bot) {
        const channel = bot.api.cache.groups[msg.channel];

        if (bot.prefix === 'QA') {
            if (!channel || channel.name !== 'qa-staging-deploy') {
                return msg.reply('Sorry, but you can\'t use that command in this channel.');
            }
        } else if (bot.prefix !== 'MP') {
            return msg.reply('Sorry, but you can\'t use that command in this org.');
        }

        const nonce = nonceGen.generateId();

        log.debug(`[Staging-${createName.toUpperCase()}] Sent a message to staging with nonce ${log.chalk.cyan(nonce)}`);

        const original = `Sending a request to ${createName} a server. \nPlease wait, this may take a while.`;

        return msg.reply(original, false)
            .then(res => {
                function edit(text, done = false) {
                    return bot.api.methods.chat.update({
                        ts: res.ts,
                        channel: res.channel,
                        text: `${original}\nCurrent Status: ${text}${(done)?'\n(No further updates)':''}`
                    });
                }

                const event = `staging-update-${nonce}`;

                MineplexSocket.on(event, data => {
                    edit(data.message, data.done).catch(e => {
                        console.error('Could not edit status:');
                        console.error(e);
                    });

                    if (data.done) {
                        // this rejects the promise for some reason...
                        //bot.chat(msg.user, data.message).catch(console.error);
                        MineplexSocket.removeAllListeners(event);
                    }
                });

                MineplexSocket[createMethod](msg.args, nonce);
            });
    };
}

class CreateServerCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'createserver',
            type: 'hidden',
            args: [new frozor.CommandArg('servertype', 'String'), new frozor.CommandArg('branch', 'String')]
        });

        this.run = getRun('createServer', 'start');
    }
}

class KillServerCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'killserver',
            type: 'hidden',
            args: [new frozor.CommandArg('server', 'String')]
        });

        this.run = getRun('killServer', 'kill');
    }
}

class CreateMPSCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'createmps',
            type: 'hidden',
            auth: true,
            args: [new frozor.CommandArg('branch', 'String')]
        });
    }

    async run(msg, bot, extra) {
        msg.args[0] = `mps:${extra.account.username}`;
        return CreateServerCommand.prototype.run(msg, bot, extra);
    }
}

module.exports = [
    CreateServerCommand,
    KillServerCommand,
    CreateMPSCommand
];