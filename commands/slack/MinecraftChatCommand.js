class MinecraftChatCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'chat',
            aliases: ['cu', 'mcchat'],
            args: [{ name: 'text', type: 'String[]', required: true }]
        });

        this.maxArgs = Number.POSITIVE_INFINITY;
    }

    async run(msg, bot, extra) {
        const client = extra.minecraftClients.US;

        const text = msg.args.join(' ');

        try {
            // Don't need to reply because I'm probably reading spoob-chat anyways
            await client.send(text);
        } catch (e) {
            return msg.reply(`Unable to send message: ${e}`);
        }
    }
}

module.exports = MinecraftChatCommand;