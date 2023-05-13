class RestartCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'restart',
            args: [
                {
                    name: 'server',
                    required: true
                },
                {
                    name: 'region',
                    required: false,
                    default: 'us'
                }
            ],
            allowedUsers: ['pr0ph3t123', 'kingcrazy_'],
            restrictToAllowed: false,
            requiredRank: 'ADMIN'
        });
    }

    async run(msg, bot, extra) {
        const server = msg.args[0];

        const region = (msg.args[1] || this.args[1].default).toUpperCase();

        if (!extra.minecraftClients[region]) {
            return msg.reply('Sorry, but that region does not exist or is unavailable.');
        }

        try {
            await extra.minecraftClients[region].mineplex.restart(server);

            return msg.reply(`Successfully restarted *${server}* on region *${region}*.`);
        } catch (e) {
            return msg.reply(`Could not restart *${region}* *${server}*: ${e}`);
        }
    }
}

module.exports = RestartCommand;