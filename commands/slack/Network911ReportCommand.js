const { servers } = require('../../lib/services/network-911');

class Network911ReportCommand extends frozor.Command {
    constructor() {
        super({
            name: 'nw911report',
            args: [
                {
                    name: 'type',
                    type: 'String',
                    required: true
                },
                {
                    name: 'name',
                    type: 'String',
                    required: false
                }
            ]
        });
    }

    sendValid(msg, type) {
        return msg.reply(`Valid server names: ${servers[type.toLowerCase()]}`);
    }

    async run(msg, bot, extra) {
        const { type, name } = this.parse(msg);

        if (!type) {
            return msg.reply('Hmm, one of those doesn\'t look quite right.');
        }

        if (!servers.hasOwnProperty(type.toLowerCase())) {
            return msg.reply('That server type doesn\'t seem to exist.');
        }

        const serversOfType = servers[type.toLowerCase()];

        if (!name) {
            return this.sendValid(msg, type);
        }

        let nw911Server;
        for (const key of Object.keys(serversOfType)) {
            if (key.toLowerCase() === name.toLowerCase()) {
                nw911Server = serversOfType[key];
                break;
            }
        }

        if (!nw911Server) {
            return this.sendValid(msg, type);
        }

        const info = [];

        info.push(['Name', nw911Server.name]);
        info.push(['Type', nw911Server.constructor.name]);
        info.push(['IP', nw911Server.server]);
        info.push(['Port', nw911Server.port]);
        info.push(['Last Ping', nw911Server.lastPing.success ? `${nw911Server.lastPing.count} Players` : 'Unsuccessful']);

        if (nw911Server.lastPing.success && nw911Server.lastTwo.older.success) {
            info.push(['Last Displacement', `${nw911Server.displacement} (${nw911Server.getDisplacementAsPercentage()})%`]);
        }

        msg.reply('', true, { attachments: [ { color: '#2196F3', title: 'Server Info', fields: info.map(info => ({ title: info[0], value: info[1], short: true })) } ] });
    }
}

module.exports = Network911ReportCommand;