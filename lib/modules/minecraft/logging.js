const { slackBots } = require('../slack/bots');

module.exports = function (client) {
    client.log = new frozor.Logger(`MC${client.options.prefix ? `|${client.options.prefix}` : ''}`);
    client.log.debug(`Successfully loaded logging module${client.options.prefix ? ` (${client.options.prefix})` : '!'}`);

    client.on('error', e => {
        client.log.error(`Minecraft Client ${client.log.chalk.cyan(client.options.prefix || 'Unknown')} encountered an error:`);
        client.log.error(e);
    });

    /*client.on('message', (text, coloredText)=>{
        // screw you, gwen
        if (text.startsWith('A GWEN >')) return;

        client.log.info(coloredText, 'CHAT');
    });*/

    function slackLog(text) {
        if (!text) {
            return;
        }

        if (frozor.DEVELOPMENT) {
            console.log(text);
        } else {
            let channel = 'spoob-chat';

            if (client.options.prefix) {
                channel += `-${client.options.prefix.toLowerCase()}`;
            }

            slackBots.MP.chat(channel, text);
        }
    }

    client.on('server-message', msg => {
        slackLog(`*${msg.prefix}>* ${msg.text}`);
    });

    client.on('private-message', msg => {
        slackLog(`*${msg.sender} > ${msg.target}* ${msg.text}`);
    });

    client.on('chat', msg => {
        slackLog(`\`${msg.level}\` *${msg.rank ? `${msg.rank} ` : ''}${msg.sender}* ${msg.text}`);
    });

    client.on('staff-chat', msg => {
        slackLog(`*${msg.rank} ${msg.sender}* ${msg.text}`);
    });

    client.on('staff-message-receive', msg => {
        slackLog(`<- *${msg.rank} ${msg.sender}* ${msg.text}`);
    });

    client.on('staff-message-send', msg => {
        slackLog(`-> *${msg.rank} ${msg.target}* ${msg.text}`);
    });

    client.on('message-unknown-type', msg => {
        if (msg.text.includes('GWEN')) {
            return;
        }

        slackLog(msg.text);
    });
};