class EchoCommand extends frozor.MinecraftCommand {
    constructor() {
        super({
            name: 'echo',
            aliases: ['e', 'repeat', 'r'],
            allowedUsers: ['artix'],
            args: [{ name: 'text', type: 'String[]', required: true }]
        });

        this.maxArgs = Number.POSITIVE_INFINITY;
    }

    async run(msg, client) {
        return client.send(msg.args.join(' '));
    }
}

module.exports = EchoCommand;