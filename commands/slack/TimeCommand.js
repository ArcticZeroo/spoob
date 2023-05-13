const { StringUtil } = require('iron-golem');

class TimeCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'time',
            requiredRank: 'TRAINEE',
            args: ['name']
        });
    }

    async run(msg, bot, extra) {
        const name = msg.args[0];

        if (!StringUtil.isValidMinecraftName(name)) {
            return msg.reply('That doesn\'t seem to be a valid Minecraft name, try again?');
        }

        try {
            const { time } = await extra.minecraftClients.US.mineplex.time(name);

            return msg.reply(`*${name}* has \`${time}\` in-game`);
        } catch (e) {
            return msg.reply(`Unable to check time for *${name}*: ${e}`);
        }
    }
}

module.exports = TimeCommand;