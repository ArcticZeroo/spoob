class WatchPlayerCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'watch',
            aliases: ['watchplayer'],
            args: [{
                name: 'player',
                required: true
            }],
            superuser: true
        });
    }

    async run(msg, client) {
        const username = msg.args[0];

        if (!client.players.has(username)) {
            return msg.reply('That player is not online.');
        }

        const player = client.players.get(username);

        client.watchPlayer(player);

        return msg.reply(`Now watching ${username}.`);
    }
}

module.exports = WatchPlayerCommand;