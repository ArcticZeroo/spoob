const { punishments: { Punishment }, endpoint } = require('../../lib/api/SamczsunAPI');

class ReapplyPunishmentCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'reapply',
            auth: ['Artix', 'DeanTM'],
            args: ['player', 'id']
        });
    }

    async run(msg, bot, extra) {
        const user = msg.args[0];
        let id = msg.args[1];

        if (!user.isValidMinecraftName()) {
            return msg.reply('That doesn\'t seem to be a valid Minecraft name. Try again?');
        }

        if (isNaN(id)) {
            return msg.reply('That ID doesn\'t seem to be a number. Try again?');
        }

        id = parseInt(id);

        let punishments;
        try {
            punishments = await endpoint.getPunishments(user);
        } catch (e) {
            console.error('Could not get punishments for a player: ');
            console.error(e);
            return msg.reply('I wasn\'t able to get that player\'s punishments, try again later?');
        }

        for (const punishment of punishments) {
            if (punishment.id === id) {
                if (punishment.active)  {
                    return msg.reply('That punishment is still active!');
                }

                punishment.duration = Punishment.getRemainingDuration(punishment);

                try {
                    await punishment.punish();
                    return msg.reply(`Success! *${punishment.target.name}* has been punished for *${(punishment.duration * 3600).toHumanReadable(1)}*.`);
                } catch (e) {
                    console.error('Could not reapply a punishment:');
                    console.error(e);
                    return msg.reply('Sorry, but I wasn\'t able to re-apply that punishment. Try again later?');
                }
            }
        }

        return msg.reply(`I couldn\'t find any punishments with an id of \`${id}\` applied to *${user}* :disappointed:`);
    }
}

module.exports = ReapplyPunishmentCommand;