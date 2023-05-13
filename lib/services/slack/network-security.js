const MineplexAPI = require('../../api/MineplexAPI');

module.exports = function (MineplexSocket, slackBots) {
    MineplexSocket.on('twoFactorReset', data => {
        if (data.admin.uuid === data.target.uuid) return;
        slackBots.MP.chat('pc-network-security', `*${data.admin.name}* reset 2fa for *${data.target.name}*.`);
    });

    MineplexSocket.on('updaterank', data => {
        const convertedRank = `${MineplexAPI.ranks.getConverted(data.target.newRank)} (\`${data.target.newRank}\`)`;

        slackBots.MP.chat('pc-network-security', `*${data.admin.name}* updated rank of *${data.target.name}* to *${convertedRank}*\n(UUID of Admin: \`${data.admin.uuid}\`)\n*${data.region} ${data.server}*`);
    });
};