const hermes = require('mc-hermes');

class McPingCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'ping',
            aliases: ['mcping', 'pingmc'],
            args: ['type', 'ip', { name: 'port', required: false }]
        });

        this.SERVER_MATCH =  /<.*\|(.*)>/;
    }

    async run(msg) {
        const opts = {
            type: msg.args[0].toLowerCase(),
            server: msg.args[1]
        };

        if (msg.args.length === 3 && !isNaN(msg.args[2])) {
            opts.port = msg.args[2];
        }

        if (this.SERVER_MATCH.test(opts.server)) {
            opts.server = this.SERVER_MATCH.exec(opts.server)[1];
        }

        const start = Date.now();

        let res, end;
        try {
            res = hermes();
            end = Date.now();
        } catch (e) {
            if (e.message && e.message.includes('timed out')) {
                return msg.reply('Sorry, but that ping timed out. Try again later?');
            } 
            return msg.reply('Sorry, but I wasn\'t able to ping that server. Try again later?');
            
        }

        const lines = [`Server Info | *${server}* (${opts.type.toUpperCase()})`];

        lines.push(`*Players:* ${res.players.online}/${res.players.max}`);
        lines.push(`*Reported Version:* ${res.version.name}`);
        lines.push(`*Ping Time:* ${end - start}ms`);

        return msg.reply(lines.join('\n'));
    }
}

module.exports = McPingCommand;