class RestartRequestCommand extends frozor.MinecraftCommand {
    constructor() {
        super({
            name: 'restartrequest',
            aliases: ['requestrestart', 'rr', 'reqrestart'],
            args: [
                {
                    name: 'Server',
                    required: true
                },
                {
                    name: 'Reason',
                    required: true
                }
            ]
        });

        this.maxArgs = Number.POSITIVE_INFINITY;
    }

    async run(msg, client, extra) {
        const server = msg.args[0];
        const region = client.region.toUpperCase();
        const reason = msg.args.slice(1).join(' ');

        try {
            await extra.slackBots.MP.chat('restart-requests', `*${msg.sender}* has requested a restart on *${region}* \`${server}\`${(reason.length) ? `\n*Reason:* ${reason}` : ''}`);
        } catch (e) {
            console.error('Could not send a restart request notification:');
            console.error(e);
            return msg.reply('Sorry, but I couldn\'t send the restart request. Please try again later.');
        }

        return msg.reply(`Successfully sent a request to restart ${region} [${server}]!`);
    }
}

module.exports = RestartRequestCommand;