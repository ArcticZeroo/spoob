const { punishments: { Category, CategoryToReadable }, endpoint: PunishmentEndpoint } = require('../../lib/api/SamczsunAPI');

class PunishmentHistoryCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'history',
            aliases: ['gethistory', 'phistory'],
            args: ['name'],
            requiredRank: 'TRAINEE',
            allowedUsers: ['Dutty'],
            restrictToAllowed: false
        });
    }

    async run(msg, client, extra) {
        if (extra.restricted !== false && !msg.channel.startsWith('D') && !msg.superuser) {
            return msg.reply('Sorry, you can only use this command in Direct Messages in this org.');
        }

        // remove slack crap
        const name = msg.args[0].replace(/\n\*`_/g, '');

        if(!name.isValidMinecraftName()) {
            return msg.reply('That doesn\'t seem to be a valid Minecraft name, try again?');
        }

        try {
            const punishments = await PunishmentEndpoint.getPunishments(name);

            let messageToSend = `Punishment history for *${name}*:`;

            punishments.reverse();

            punishments.forEach(punishment => {
                const offense = `[${CategoryToReadable.get(punishment.category)} ${punishment.severity}]`;
                const by = `*${punishment.admin.name}* for "${punishment.reason}" at \`${new Date(punishment.time).toLocaleString()}\``;
                const length = (punishment.category === Category.WARNING) ? 'Warning' : (punishment.duration === -1) ? 'Permanent' : (punishment.duration*60*60).toHumanReadable();
                const active = (punishment.active) ? 'Active' : (punishment.removed) ? `Removed by *${punishment.removeAdmin.name}* at \`${new Date(punishment.removeTime).toLocaleString()}\` for "${punishment.removeReason}"` : 'Expired';

                messageToSend += `\n*${offense}* by ${by} | ${length} | ${active} | \`${punishment.id}\``;
            });

            messageToSend += `\nThis player has a total of \`${punishments.length}\` *Punishments*.`;

            return msg.reply(messageToSend);
        } catch (e) {
            if ((e.message || e || '').includes('does not exist')) {
                return msg.reply(`Sorry, but it appears that *${name}* does not exist.`);
            }

            console.error('PunishmentHistoryCommand encountered an error:');
            console.error(e);

            if (e.toString() === '256') {
                return msg.reply('The server is currently unable to handle requests, please try again later.');
            }

            return msg.reply('An unexpected error occurred, please try again later.');
        }
    }
}

module.exports = PunishmentHistoryCommand;