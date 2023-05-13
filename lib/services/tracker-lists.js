const Logger = require('frozor-logger');

const db = require('../database/mongo/');
const MineplexSocket = require('../api/MineplexSocket');
const nameConverter = require('../storage/username-converter');

const log = new Logger('TRACKER');

const { slackBots } = require('../modules/slack/bots');
const { DatabaseListController, LoadPreference } = require('../api/lists/database-lists');

class TrackerListController extends DatabaseListController {
    constructor() {
        super('TrackedPlayerList', LoadPreference.WAIT_FOR_SOCKET_AND_DATABASE);
    }

    start() {
        this.loadFromDb()
            .then(() => {
                log.info(`Successfully loaded ${log.chalk.magenta(controller.lists.size)} list(s) from the database.`);
            })
            .catch(e => {
                log.error(`Could not load tracker lists from the database: ${log.chalk.red(e)}`);
            });
    }

    activate(user) {
        MineplexSocket.stalk(user);
    }

    deactivate(user) {
        MineplexSocket.unstalk(user);
    }
}

const controller = new TrackerListController();

async function handlePlayerJoin(uuid, region) {
    uuid = uuid.replace(/-/g, '');

    for (const trackerList of controller.listIterator) {
        if (!trackerList.enabled) {
            continue;
        }

        if (trackerList.users.includes(uuid)) {
            const bot = slackBots[trackerList.team];

            if (bot) {
                let userString = uuid;

                try {
                    userString = await nameConverter.getUsername(uuid);
                } catch (e) {
                    console.error(e);
                }

                return bot.chat(trackerList.channel, `[*${trackerList.name}*] User *${userString}* has joined on region *${region}*`).catch(e => {
                    console.error(`Could not send message for list ${log.chalk.cyan(trackerList.name)}:`);
                    console.error(e);
                });
            }
        }
    }
}

MineplexSocket.on('playerJoin', function (uuid, region) {
    handlePlayerJoin(uuid, region).catch(e => {
        console.error('handlePlayerJoin encountered an error:');
        console.error(e);
    });
});

module.exports = { controller, TrackerListController };