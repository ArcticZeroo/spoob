// Load polyfills and custom functions before anything else
require('./lib/defs');

// Load global logger
const Logger = frozor.Logger = require('frozor-logger');
global.log = frozor.log  = new Logger();

// Don't crash the whole program just because a promise was rejected :(
process.on('unhandledRejection', console.error);

if (frozor.DEVELOPMENT) {
    // Don't crash the whole process in debug mode when there is an error
    process.on('error', console.error);
}

const { init: slackInit, slackBots } = require('./lib/modules/slack/bots');

const { init: minecraftInit, clients: minecraftClients } = require('./lib/modules/minecraft/client');

// Just require the commands, it'll get the handler and configure stuff automagically
require('./commands');

const slackCommands = require('./lib/SlackCommandHandler');
const MineplexSocket = require('./lib/api/MineplexSocket');
const mongoDb = require('./lib/database/mongo/');

// THIS STARTS THE BOT
// We wait for DB to open to prevent bad things from happening.
mongoDb.mongoose.connection.once('open', () => {
    if (!process.env.NO_SLACK) {
        slackInit();
    }

    if (!process.env.NO_MINECRAFT) {
        minecraftInit().catch(console.error);
    }

    registerSlackEvents();

    MineplexSocket.once('connected', () => {
        registerSocketEvents();
    });
});

function registerSlackEvents(){
    function getExtra(options = {}) {
        return Object.assign({
            dirname       : __dirname,
            slackBots,
            minecraftClients
        }, options);
    }

    function getCommandProcessor(bot, extra = {}) {
        return msg => {
            if (!bot.firstEvent || bot.firstEvent > msg.ts * 1000) {
                return;
            }

            slackCommands.process(msg, getExtra(extra), bot).catch(e => {
                console.error('slackCommandHandler could not process a command:');
                console.error(`${log.chalk.magenta('text')}: ${msg.text}`);
                console.error(`${log.chalk.magenta('commandName')}: ${msg.commandName}`);
                console.error(e);

                msg.reply('Something went very wrong. You should probably let somebody know.').catch(e => {
                    console.error('What the hell? Even replying to them doesn\'t work.');
                    console.error(e);
                });
            });
        };
    }

    if (frozor.DEVELOPMENT && !process.env.NORMAL_SLACK_ORGS) {
        slackBots.FROZOR.on('command', getCommandProcessor(slackBots.FROZOR));
    } else {
        slackBots.SENTRY.on('command', getCommandProcessor(slackBots.SENTRY));
        //slackBots.CASUAL.on('command', getCommandProcessor(slackBots.CASUAL));
        //slackBots.SUBTEAM.on('command', getCommandProcessor(slackBots.SUBTEAM));
        slackBots.STAFFMANAGE.on('command', getCommandProcessor(slackBots.STAFFMANAGE));

        slackBots.MP.on('command', getCommandProcessor(slackBots.MP, {
            secure: true,
            restricted: false
        }));

        slackBots.QA.on('command', getCommandProcessor(slackBots.QA, {
            restricted: false
        }));
    }
}

function registerSocketEvents() {
    // Require socket services
    require('./lib/gwen/sentry/')(MineplexSocket);
    require('./lib/services/slack/command-logging')(MineplexSocket, slackBots);
    require('./lib/services/slack/gwen-bans')(MineplexSocket, slackBots);
    require('./lib/services/slack/network-security')(MineplexSocket, slackBots);
    require('./lib/services/slack/punishment-notifications')(MineplexSocket, slackBots);
    require('./lib/services/socket-misc')(MineplexSocket);

    require('./lib/services/inappropriate-names');
}