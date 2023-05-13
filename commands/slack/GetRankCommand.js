const rankCache = require('../../lib/storage/RankCache');

class GetRankCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'getrank',
            auth: true,
            requiredRank: 'BUILDER',
            elevatedRank: 'ADMIN',
            args: [{
                name: 'user',
                required: false
            }]
        });
    }

    async run(msg, bot, extra) {
        const name = msg.args[0] || extra.account.username;

        if (!name.isValidMinecraftName()) {
            return msg.reply('That name doesn\'t seem to be valid... did you type it right?');
        }

        let rankData;
        try {
            rankData = await rankCache.getEntry(name);
        } catch (e) {
            throw e;
        }

        if (!extra.elevated) {
            return msg.reply(`The user *${name}* has primary rank *${rankData.primary.name.toUpperCase()}*`);
        }

        const fields = [{
            title: 'Primary Rank',
            value: rankData.primary.tag,
            short: true
        }];

        if (rankData.additional && rankData.additional.length) {
            fields.push({
                title: `Additional Rank(s) (${rankData.additional.length})`,
                value: rankData.additional.map(r => (r.tag || r.name).toUpperCase()).join(', ')
            });
        }

        return msg.reply('', true, { attachments: [
            {
                fields,
                color: '#2196F3',
                title: `:information_source: Rank Data for ${name}`,
            }
        ] });
    }
}

module.exports = GetRankCommand;