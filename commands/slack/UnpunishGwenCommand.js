const { StringUtil } = require('iron-golem');
const { endpoint: PunishmentEndpoint } = require('../../lib/api/SamczsunAPI');

const TOKEN_REGEX = /^\[GWEN[\s\S]*(?:Token[\s\S])?(\s([0-9A-Z]{8,12}))$/;

class UnpunishGwenCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'removegwen',
            args: ['username', 'id|\'auto\'|\'all\'', 'reason'],
            allowedOrgs: ['QA'],
            allowedChannels: ['gwen-help']
        });

        this.maxArgs = Number.POSITIVE_INFINITY;
    }

    async run(msg) {
        const name = msg.args[0];
        const id = msg.args[1];
        const reason = msg.args.slice(2).join(' ');

        if (!StringUtil.isValidMinecraftName(name)) {
            return msg.reply('That doesn\'t seem to be a valid Minecraft name. Try again?');
        }

        let toRemove = [];

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
        } else if(!isNaN(id)) {
            for (const punishment of punishments) {
                if (punishment.id === id) {
                    toRemove.push(punishment);
                    break;
                }
            }
        } else {
            return msg.reply('Hmm, that ID doesn\'t seem valid. Try again?');
        }

        const validAdmins = ['Spoobncoobr', 'Chiss'];

        toRemove = toRemove.filter(p => validAdmins.includes(p.admin.name) && TOKEN_REGEX.test(p.reason));

        if (toRemove.length === 0) {
            return msg.reply('There were no punishments to remove!');
        }

        for (const punishment of toRemove) {
            try {
                await PunishmentEndpoint.removePunishment(punishment, reason);
            } catch (e) {
                return msg.reply(`Sorry, but I wasn't able to remove a punishment on that player (id: ${punishment.id}). Please try again later.`);
            }
        }

        return msg.reply(`Successfully removed ${toRemove.length} GWEN punishment${toRemove.length === 1 ? '' : 's'} from *${name}*.`);
    }
}

module.exports = UnpunishGwenCommand;