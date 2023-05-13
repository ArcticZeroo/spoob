const MineplexAPI = require('../../lib/api/MineplexAPI');

class WhoAmICommand extends frozor.SlackCommand {
    constructor () {
        super({
            name: 'whoami',
            aliases: ['me'],
            description: 'Find out who you really are on the inside',
            args: [],
            requiredRank: 'PLAYER'
        });
    }

    async run (msg, bot, extra) {
        const { account } = extra;

        msg.reply(`Don't be silly! You're *${account.username}*, and your rank is *${MineplexAPI.ranks.getConverted(account.rank)}*. You have \`${account.spoobux}\` Spoobux`);
    }
}

module.exports = WhoAmICommand;