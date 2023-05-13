const { StringUtil } = require('iron-golem');
const { convert: convertRank, primaryRanks, RankType } = require('mineplex-ranks');
const rankCache = require('../../lib/storage/RankCache');

class CheckRankCommand extends frozor.MinecraftCommand {
    constructor() {
        super({
            name: 'checkrank',
            aliases: ['getrank', 'rank'],
            args: ['name'],
            requiredRank: 'BUILDER'
        });
    }

    async run(msg) {
        const name = msg.args[0];

        if (!StringUtil.isValidMinecraftName(name)) {
            return msg.reply('That doesn\'t seem to be a valid Minecraft name. Try again?');
        }

        function formatter(rank) {
            return `${name} is rank [${rank}]`;
        }

        try {
            const rankData = await rankCache.getEntry(name);

            // Only convert to primary ranks
            const convertedRank = convertRank(rankData.primary || rankData, RankType.PRIMARY);

            if (convertedRank === primaryRanks.UNKNOWN) {
                return msg.reply(formatter(`Unknown - ${rankData.primary.tag.toUpperCase()}`));
            }

            return msg.reply(formatter(convertedRank.tag));
        } catch (e) {
            console.error('Could not get rank from rank cache:');
            console.error(e);
            return msg.reply('Sorry, but I couldn\'t check that person\'s rank. Do they exist?');
        }
    }
}

module.exports = CheckRankCommand;