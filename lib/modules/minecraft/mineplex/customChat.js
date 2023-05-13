const MineplexAPI = require('../../../api/MineplexAPI');
const RankCache = require('../../../storage/RankCache');
const { convert } = require('mineplex-ranks');

function cacheRank(target, rank) {
    rank = convert(rank);

    if (RankCache.hasValid(target)) {
        const rankData = RankCache.getEntry(target);
        rankData.primary = rank;
    } else {
        RankCache.set(target, { primary: rank, additional: [] });
    }
}

module.exports = function modifyCustomChatObject(client) {
    client.on('custom-chat', (type, msg) => {
        if (msg.type === 'staff-message-send') {
            if (msg.rank) {
                cacheRank(msg.target, msg.rank);
            }

            return;
        }

        if (msg.rank) {
            cacheRank(msg.sender, msg.rank);
        }

        msg.user = {
            name: msg.sender,
            rank: msg.rank,
            level: msg.level,
            send: text => msg.client.send(`/m ${msg.sender} ${text}`)
        };

        msg.text = msg.text.trim();
        msg.args = msg.text.split(/\s+/);
    });
};