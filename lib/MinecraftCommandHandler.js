const Logger = require('frozor-logger');
const log = new Logger('COMMANDS');

const { Command, CommandHandler } = require('frozor-commands');

const config = require('../config/commands');
const rankCache = require('./storage/RankCache');
const { convert, has } = require('mineplex-ranks');

const commandHandler = new CommandHandler({
    formatter: {
        // Disable the permission reply so that we can do something custom
        permission: () => false,
        minargs: (msg, cmd, bot, extra) => `Not enough arguments! Usage: [ ${cmd.getUsageStatement()} ]`,
        maxargs: (msg, cmd, bot, extra) => `Too many arguments! Usage: [ ${cmd.getUsageStatement()} ]`,
        error: (msg, cmd, bot, extra, e) => `Unable to process command [ ${cmd.name} ], please try again later.`,
        logger: (msg, cmd, client, extra, success) => {
            const region = client.options.prefix || 'Unknown';

            log.command(msg.user.name, msg.commandName, `Minecraft|${region}`, success);
        }
    }
});

/**
 * @param {object} msg - The message sent by the client
 * @param {string} msg.type - The type of message
 * @param {function} msg.reply - A function that allows replying to a message
 * @param {object} msg.user - User information about the sender.
 * @param {boolean} [msg.user.superuser] - Whether this user is a superuser.
 * @param client
 * @param extra
 * @return {Promise.<boolean>}
 */
Command.prototype.minecraftCanRun = async function (msg, client, extra = {}) {
    if (frozor.DEVELOPMENT && !config.superuser.includes(msg.user.name.toLowerCase())) {
        msg.reply('Sorry, but I\'m currently in maintenance mode, so you can\'t use commands.');
        return false;
    }

    const cmd = this;

    const fail = m => {
        return msg.reply(m).then(() => false);
    };

    extra.shouldBypass = extra.shouldBypass || false;

    if (config.superuser.includes(msg.user.name.toLowerCase())) {
        msg.user.superuser = true;
        extra.shouldBypass = true;
    } else {
        if (cmd.superuser === true) {
            return fail('You must be a [SuperUser] to run this command.');
        }
    }

    if (cmd.allowedUsers.length > 0) {
        if (cmd.allowedUsers.includes(msg.user.name.toLowerCase())) {
            extra.shouldBypass = true;
        } else {
            if (cmd.restrictToAllowed !== false && !msg.user.superuser) {
                return fail('You are not permitted to execute this command.');
            }
        }
    }

    // Put this after anything that needs to be in extra for the command to work
    // On slack, this is rank and account. Rank is already in the message though
    if (extra.shouldBypass) {
        return true;
    }

    let rankData;
    if (cmd.requiredRank) {
        try {
            rankData = await rankCache.getEntry(msg.user.name);
        } catch (e) {
            console.error('Could not get a player\'s rank:');
            console.error(e);
            return fail('I wasn\'t able to get your rank, sorry  :(');
        }

        if (!has(cmd.requiredRank, rankData)) {
            return fail(`This command requires rank [${convert(cmd.requiredRank).name.toUpperCase()}]`);
        }
    }

    if (cmd.chatTypes) {
        if (!cmd.chatTypes.includes(msg.type)) {
            return fail('Sorry, but you can\'t use that command here.');
        }
    }

    //TODO: Auth checking
    //DONE: Username checking
    //DONE: Chat type checking
    //DONE: Rank checking
    //TODO: Level checking, maybe.

    return true;
};

module.exports = commandHandler;