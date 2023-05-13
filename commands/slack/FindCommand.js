const { StringUtil } = require('iron-golem');

const find = require('../../lib/modules/minecraft/mineplex/find');

class FindCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'find',
            aliases: ['locate'],
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
            const { isOnline, server, region } = await find.multiRegion(extra.minecraftClients, name);

            if (!isOnline) {
                return msg.reply(`*${name}* is not online across \`${Object.keys(extra.minecraftClients).length}\` region(s).`);
            }

            return msg.reply(`Located *${name}* on *${region}* \`/server ${server}\``);
        } catch (e) {
            return msg.reply(`Unable to find *${name}*: ${e}`);
        }
    }
}

module.exports = FindCommand;