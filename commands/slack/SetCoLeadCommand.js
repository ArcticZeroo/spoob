class SetCoLeadCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'setcolead',
            aliases: ['colead'],
            requiredRank: 'ADMIN',
            args: ['player', 'community']
        });
    }

    async run(msg, bot, extra) {
        const [name, community] = msg.args;

        try {
            await extra.minecraftClients.US.mineplex.communities.updatePosition(name, community, 'colead');

            return msg.reply(`*${name}* is now a Co-Lead in *${community}*!`);
        } catch (e) {
            return msg.reply(`Unable to set position for for *${name}* in *${community}*: ${e}`);
        }
    }
}

module.exports = SetCoLeadCommand;