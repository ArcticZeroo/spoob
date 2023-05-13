const SocketBan = require('../../gwen/SocketBan');

module.exports = function (MineplexSocket, slackBots) {
    MineplexSocket.on('gwenBan', (data, banwave) => {
        const GwenBan = new SocketBan(data, banwave);

        const slackMessage = (GwenBan.isBanwave) ? `*${GwenBan.playerName}* (UUID \`${GwenBan.uuid}\`) has been flagged for *${GwenBan.hack}*. Their ban will trigger at \`${new Date(GwenBan.timeToBan).toLocaleString()}\`. Token: \`${GwenBan.metadata}\`` : `*${GwenBan.username}* (UUID \`${GwenBan.uuid}\`) has been banned for *${GwenBan.hack}*. Token: \`${GwenBan.metadata}\``;

        slackBots.MP.chat('gwen-bans', slackMessage);
    });
};