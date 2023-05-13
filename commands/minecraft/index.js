const { slackBots } = require('../../lib/modules/slack/bots');
const { clients } = require('../../lib/modules/minecraft/client');

const commandHandler = require('../../lib/MinecraftCommandHandler');

for (const region of Object.keys(clients)) {
    const client = clients[region];

    client.on('command', function (msg) {
        if (client.username === msg.user.name)  {
            return;
        }

        if (!msg.commandName) {
            return;
        }

        //TODO: Extra with slackbots and such
        commandHandler.process(msg, { minecraftClients: clients, slackBots }, client);
    });
}

frozor.MinecraftCommand = class MinecraftCommand extends frozor.Command {
    constructor(data) {
        super(data);
        this.canRun = frozor.Command.prototype.minecraftCanRun;
    }
};

const commands = [
    frozor.loadCommand(require('./EchoCommand')),
    frozor.loadCommand(require('./ReportNameCommand')),
    frozor.loadCommand(require('./FindCommand')),
    frozor.loadCommand(require('./HiCommand')),
    frozor.loadCommand(require('./CheckRankCommand')),
    frozor.loadCommand(require('./RestartRequestCommand')),
    ...frozor.loadCommand(require('./RankedCommands'))
].filter(c => !!c);

commandHandler.register(...commands);