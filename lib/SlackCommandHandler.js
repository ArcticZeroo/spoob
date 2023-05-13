const Logger = require('frozor-logger');
const log = new Logger('COMMANDS');

const { Command, CommandHandler } = require('frozor-commands');
const { has } = require('mineplex-ranks');

const config = require('../config/commands');

const commandHandler = new CommandHandler({
    formatter: {
        // Disable the permission reply so that we can do something custom
        permission: () => false,

        logger: (msg, cmd, bot, extra, success) => {
            const slackTeam = bot.prefix;

            let user = `${log.chalk.cyan(msg.user.name)}${log.chalk.white('@')}${log.chalk.magenta(msg.user.id)}`;

            if (extra.account) {
                user = `${log.chalk.yellow(extra.account.username)} ${log.chalk.white(`(${user})`)}`;
            }

            log.command(user, msg.commandName, `Slack|${slackTeam}`, success);
        },

        error: (msg, cmd, client, extra, e) => {
            console.error(`Ran into an error while attempting to run command ${log.chalk.cyan(cmd.name)}:`);
            console.error(e);

            return `Unable to process command *${cmd.name}*, please try again later.`;
        }
    }
});

const MineplexAPI = require('./api/MineplexAPI');
const findAccount = require('./accounts/find');
const rankCache = require('./storage/RankCache');

function hasCommandAccountBypass(cmd, account) {
    if (!account) {
        return false;
    }

    if (!account.slack_commands.length) {
        return false;
    }

    const bypassCommands = account.slack_commands;

    for (const name of cmd.names()) {
        if (bypassCommands.includes(name.toLowerCase())) {
            return true;
        }
    }

    return false;
}

function hasUserPermission(cmd, msg, account) {
    if (hasCommandAccountBypass(cmd, account)) {
        return true;
    }

    return cmd.allowedUsers.length > 0
        && ((account && cmd.allowedUsers.includes(account.username))
            || cmd.allowedUsers.includes(msg.user.name));
}

async function checkAuth(cmd, msg, bot, extra) {
    let account;
    try {
        account = await findAccount.fromSlack(msg.user.id);
    } catch (e) {
        if (e === frozor.SpoobErrors.ACCOUNT_LOOKUP_ERROR) {
            throw (e);
        }
    }

    if (hasUserPermission(cmd, msg, account)) {
        extra.shouldBypass = true;
        return account;
    } else if (cmd.allowedUsers.length > 0 && (cmd.restrictToAllowed !== false)) {
        if (cmd.rankBypass) {
            try {
                const rankData = await rankCache.getEntry(account.username);

                account.rank = rankData.primary.name.toUpperCase();
                account.rankData = rankData;
            } catch (e) {
                throw (frozor.SpoobErrors.COULD_NOT_GET_RANK);
            }

            // Allow a certain rank permission to bypass
            // other checks, with inheritance enabled
            if (has(cmd.rankBypass, account.rankData)) {
                extra.shouldBypass = true;
                return account;
            }
        }
        // If there is at least 1 allowed user, and the command is restricted to allowed users
        // (which is enabled by default, and must be explicitly disabled with restrictToAllowed)
        // then don't allow them to run it.
        throw (frozor.SpoobErrors.AUTH_NOT_APPROVED);
    }

    // If auth is required, account must not be null for it to be allowed
    // Since it's not explicit auth, we continue to check other command conditions
    if (cmd.auth === true) {
        if (account == null) {
            throw (frozor.SpoobErrors.ACCOUNT_AUTH_NOT_STARTED);
        }
        // If auth is required to not exist, account MUST be null for it to be allowed
        // Since it's not explicit auth, same as above.
    } else if (cmd.auth === false) {
        if (account != null) {
            throw (frozor.SpoobErrors.ACCOUNT_IS_AUTHED);
        }
        // This is EXPLICIT auth, meaning you MUST be in the array to use the command.
        // Unlike true or false values, this does not check other conditions.
    } else if (Array.isArray(cmd.auth)) {
        if (account == null) {
            throw (frozor.SpoobErrors.ACCOUNT_AUTH_NOT_STARTED);
        }

        if (cmd.auth.includes(account.username.toLowerCase())) {
            return account;
        } 
        throw (frozor.SpoobErrors.AUTH_NOT_APPROVED);
        
    } else {
        // If it hasn't returned by now, I really don't know what format auth is in.
        // Keep going but warn
        log.warning(`Auth is an invalid value: ${log.chalk.yellow(typeof cmd.auth)}`, 'AUTH');
    }

    return account;
}

function authFail(e, fail, bot = { self: { name: 'gwen' } }) {
    switch (e) {
        case frozor.SpoobErrors.ACCOUNT_LOOKUP_ERROR:
            //This means something did a bad
            fail('There was an error when looking up your account. Please try again later.');
            break;
        case frozor.SpoobErrors.ACCOUNT_NOT_FOUND:
        case frozor.SpoobErrors.ACCOUNT_AUTH_NOT_STARTED:
            //This means that they haven't even started auth, and the command does require it.
            fail(`You do not yet have an account, and this command requires an authenticated account. Create one by running \`@${bot.self.name} auth\` and follow the instructions!`);
            break;
        case frozor.SpoobErrors.AUTH_NOT_APPROVED:
            //This means they aren't on the approved senders _list
            fail('You are not permitted to execute this command.');
            break;
        case frozor.SpoobErrors.ACCOUNT_IS_AUTHED:
            //This means that they are not supposed to be authed :scream:
            fail('You must not be authenticated to run this command.');
            break;
        case frozor.SpoobErrors.ACCOUNT_NOT_AUTHED:
            // This means that they are supposed to be authed but are not :scream:
            // This should not really happen anymore!
            fail('You must be authenticated to run this command.');
            break;
        default:
            //Unknown error  ¯\_(ツ)_/¯
            console.error('Unknown auth error');
            console.error(e);
            fail('An unknown error occurred when attempting to authenticate you. Please try again later.');
            break;
    }
}

Command.prototype.allowedChannels = [];

/*
 Commands can use the following conditions (checked in the following order):

 - User authentication (auth)
    - a command can require that a user is authed to use the command (for instance to use their username)
    - a command can require that a user is NOT authed to use the command (for instance to start auth)
    - a command can require only that only a specific set of users may use this command
    - Even if they pass this, they are susceptible to other conditions failing

 - Bypass users (allowedUsers)
    - If the user is authed, they immediately bypass all further checks.

 - User minecraft rank (requiredRank)
    - This requires the user to be authed

 - Channel the message was posted in (allowedChannels)
    - This only checks channel name
    - If this is set, channel type is not checked

 - Channel TYPE the message was posted in (channelType)
    - G for group, D for direct, C for channel
 */
Command.prototype.slackCanRun = async function (msg, bot, extra = {}) {
    if (frozor.DEVELOPMENT && !config.superuser.includes(msg.user.name) && !process.env.NO_MAINTENANCE) {
        msg.reply('I am currently in maintenance mode and commands can\'t be used. Sorry about that.\nBy the way, you might see another response to your command. If you do... ignore me, because there\'s two of me running!');
        return false;
    }

    const cmd = this;

    const fail = msg.reply.bind(msg);

    extra.shouldBypass = extra.shouldBypass || false;

    // If the user is a superuser, set them to be able to bypass
    // other restrictions.
    //
    // If they are not a superuser, check if the command requires
    // that they are a superuser, and fail if so, continue otherwise.
    if (config.superuser.includes(msg.user.name)) {
        msg.user.superuser = true;
        extra.shouldBypass = true;
    // It needs to be true, not just truthy
    } else if (cmd.superuser === true) {
        fail('You must be *SuperUser* to run this command.');
        return false;
    }

    // If there is a required rank, and auth is un-specified
    // Auth needs to be true or an array for requiredRank to
    // to end up passing, since if they didn't have an account
    // there is no way to link them to MC and get their rank.
    if (cmd.requiredRank != null && (cmd.auth == null || cmd.auth === false)) {
        cmd.auth = true;
    }

    // Get the account of the user, if there's a reason to.
    // If auth is null, account is not necessary to get,
    // because it will never be accessed and is not part
    // of the canRun process at this point
    let account;
    if (cmd.auth != null) {
        try {
            account = await checkAuth(this, msg, bot, extra);
        } catch (e) {
            if (extra.shouldBypass && e === frozor.SpoobErrors.AUTH_NOT_APPROVED) {
                return true;
            }

            authFail(e, fail, bot);
            return false;
        }

        extra.account = account;
    }

    // Get the user's rank if the command requires it, and
    // check whether they have permission to run the command.
    // This trumps channel stuff, because no matter where
    // they're running it, if you don't have the right rank,
    // you don't have the right rank.
    let rankData;
    if (cmd.requiredRank != null) {
        if (!account) {
            fail('Hmm... I tried to check your rank, but your account does not seem to exist.');
            return false;
        }

        if (account.rankData) {
            rankData = account.rankData;
        } else {
            try {
                rankData = await rankCache.getEntry(account.username);
            } catch (e) {
                console.error(e);
                fail('Hmm... I tried to check your rank, but something went wrong. Have you changed your name?');
                return false;
            }
        }

        if (!extra.shouldBypass && !has(cmd.requiredRank, rankData)) {
            fail(`This command requires permission rank [*${MineplexAPI.ranks.getConverted(cmd.requiredRank).toUpperCase()}*].`);
            return false;
        }

        if (cmd.elevatedRank != null) {
            if (msg.user.superuser || has(cmd.elevatedRank, rankData)) {
                extra.elevated = true;
            }
        }

        account.rank = rankData.primary.name.toUpperCase();
        account.rankData = rankData;
    }

    // If they should bypass the rest of the checks then uh... do it.
    // They only got this far so we could add rank or account to extra.
    if (extra.shouldBypass) {
        return true;
    }

    if (cmd.allowedOrgs && Array.isArray(cmd.allowedOrgs)) {
        if (!cmd.allowedOrgs.includes(bot.prefix.toUpperCase())) {
            fail(`Sorry, but you can't use that command in this org. Try running it in one of these: *${cmd.allowedOrgs.join('*, *')}*`);
            return false;
        }
    }

    // Get the channel if there allowedChannels has any content,
    // because it means the command can only be run in those.
    let channel;
    if (cmd.allowedChannels.length > 0) {
        const id = msg.channel;

        const types = ['channels', 'groups'];

        for (const type of types) {
            const cachedChannel = bot.api.cache[type][id];

            if (cachedChannel) {
                channel = cachedChannel;
                break;
            }
        }

        if (!channel) {
            fail('Hmm... I tried to check the channel, but something went wrong. Try again later?');
            return false;
        }

        if (!cmd.allowedChannels.includes(channel.name)) {
            fail('Sorry, but you can\'t run that command in this channel.');
            return false;
        }

        // If it fits the bill for allowed channel, no need to check
        // channel type, because you should really know the type before
        // just adding it to the array. Shame on you if this causes
        // problems!
        return true;
    }

    // Finally, get the channel if you didn't before (which you wouldn't
    // since it returns no matter what), and check if it can be run based
    // on the first character of the command's channelType property and the
    // channel ID's first character (which is either D, G, or C)
    if (cmd.channelType != null) {
        const channelType = cmd.channelType.toUpperCase()[0];

        if (!channel) {
            try {
                channel = await bot.api.storage.channels.get(msg.channel);
            } catch (e) {
                fail('Hmm... I tried to check the channel, but something went wrong. Try again later?');
                return false;
            }
        }

        if (channel.id[0] != channelType) {
            fail(`Sorry, but you can\'t use that command in this type of channel. Required: *${cmd.channelType.toUpperCase()}*`);
            return false;
        }
    }

    return true;
};

module.exports = commandHandler;