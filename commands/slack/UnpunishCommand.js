const { StringUtil } = require('iron-golem');
const { endpoint: PunishmentEndpoint } = require('../../lib/api/SamczsunAPI');

class UnpunishCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'unpunish',
            aliases: ['unban', 'removepunishment'],
            args: ['username', 'id|\'auto\'|\'all\'', 'reason'],
            allowedUsers: ['artix']
        });

        this.maxArgs = Number.POSITIVE_INFINITY;
    }

    async run(msg, client, extra) {
        const name = msg.args[0];
        const id = msg.args[1];
        const reason = msg.args.slice(2).join(' ');

        if (!StringUtil.isValidMinecraftName(name)) {
            return msg.reply('That doesn\'t seem to be a valid Minecraft name. Try again?');
        }

        const toRemove = [];

        // If ID is a number
        if (!isNaN(id)) {
            toRemove.push(parseInt(id));
        } else {
            let punishments;
            try {
                punishments = await PunishmentEndpoint.getPunishments(name);
            } catch (e) {
                if ((e.message || e || '').includes('does not exist')) {
                    return msg.reply(`Sorry, but it appears that *${name}* does not exist.`);
                }

                console.error('UnpunishCommand encountered an error:');
                console.error(e);

                if (e.toString() === '256') {
                    return msg.reply('The server is currently unable to handle requests, please try again later.');
                }

                return msg.reply('An unexpected error occurred when getting history, please try again later.');
            }

            const activePunishments = punishments.filter(p => p.active);

            if (id.toLowerCase().startsWith('auto')) {
                if (activePunishments.length) {
                    toRemove.push(activePunishments.reverse()[0]);
                }
            } else if (id.toLowerCase() === 'all') {
                toRemove.push(...activePunishments);
            } else {
                return msg.reply('Hmm, that ID doesn\'t seem valid. Try again?');
            }
        }

        if (toRemove.length === 0) {
            return msg.reply('There were no punishments to remove!');
        }

        for (let punishment of toRemove) {
            if (typeof punishment === 'number') {
                punishment = { id: punishment, target: { name } };
            }

            try {
                await PunishmentEndpoint.removePunishment(punishment, reason);
            } catch (e) {
                return msg.reply(`Sorry, but I wasn't able to remove a punishment on that player (id: ${punishment.id}). Please try again later.`);
            }
        }

        return msg.reply(`Successfully removed ${toRemove.length} punishment${toRemove.length === 1 ? '' : 's'} from *${name}*.`);
    }
}

module.exports = UnpunishCommand;