class RestartRequestCommand extends frozor.SlackCommand {
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
                    name: 'Region - US/EU/(PE|BEDROCK|BR|MCO)',
                    required: true,
                    default: 'US'
                },
                {
                    name: 'Reason',
                    required: true
                }
            ],
            auth: true
        });

        this.maxArgs = Number.POSITIVE_INFINITY;

        this.ALLOWED_REGIONS = ['us', 'eu', 'br', 'bedrock', 'pe', 'mco'];
    }

    async run(msg, client, extra) {
        const server = msg.args[0];
        const region = (msg.args[1] && this.ALLOWED_REGIONS.includes(msg.args[1].toLowerCase())) ? msg.args[1].toUpperCase() : this.args[1].default;
        const reason = msg.args.slice(2).join(' ');

        try {
            await extra.slackBots.MP.chat('restart-requests', `*${extra.account.username}* has requested a restart on *${region}* \`${server}\`${(reason.length) ? `\n*Reason:* ${reason}` : ''}`);
        } catch (e) {
            console.error('Could not send a restart request notification:');
            console.error(e);
            return msg.reply('Sorry, but I couldn\'t send the restart request. Please try again later.');
        }

        return msg.reply(`Successfully sent a request to restart *${region}* \`${server}\`!`);
    }
}

module.exports = RestartRequestCommand;