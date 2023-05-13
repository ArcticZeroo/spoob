const { SlackBot } = require('frozor-slackbot');

const config = require('../../../config');
const moduleLoader = require('../moduleLoader');
const MineplexSocket = require('../../api/MineplexSocket');

const slackBots = (frozor.DEVELOPMENT && !process.env.NORMAL_SLACK_ORGS) ? {
    FROZOR: new SlackBot(config.slack.tokens.frozor, true, 'FROZOR')
} : {
    QA      : new SlackBot(config.slack.tokens.qa       , true, 'QA'),
    MP      : new SlackBot(config.slack.tokens.mineplex , true, 'MP'),
    CASUAL  : new SlackBot(config.slack.tokens.casual   , true, 'CASUAL'),
    SENTRY  : new SlackBot(config.slack.tokens.gwen     , true, 'GWEN'),
    STAFFMANAGE: new SlackBot(config.slack.tokens.staffmanage, true, 'STAFFMANAGE'),
    SOCIALMEDIA: new SlackBot(config.slack.tokens.socialmedia, true, 'SOCIALMEDIA')
};

const modules = [
    require('./superuser-delete')
];

function registerEvents(slackBot) {
    function errorHandler(name){
        slackBot.log.warning(`Restarting script in ${slackBot.log.chalk.magenta(2.5)}s due to ${name}...`);
        setTimeout(() => {
            process.exit();
        }, 2500);
    }

    slackBot.on('authFail', () => errorHandler('authentication failure'));
    slackBot.on('error', () => errorHandler('unknown error'));
}

function load(slackBot) {
    slackBot.firstEvent = Date.now();

    slackBot.init();

    moduleLoader.load(modules, slackBot);

    registerEvents(slackBot);
}

function init() {
    for (const team of Object.keys(slackBots)) {
        const slackBot = slackBots[team];

        load(slackBot);
    }

    if (frozor.DEVELOPMENT && !process.env.NORMAL_SLACK_ORGS) {
        /*slackBots.FROZOR.api.once('hello', () => {
            MineplexSocket.connect();
        });*/
    } else {
        if (slackBots.MP) {
            slackBots.MP.api.once('hello', () => {
                MineplexSocket.connect();

                // Load NW911 with the bot and channel required
                require('../../services/network-911');
            });
        }
    }
}

module.exports = { slackBots, init };