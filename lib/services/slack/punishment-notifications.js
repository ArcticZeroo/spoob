const Logger = require('frozor-logger');
const log = new Logger('PUNISHMENTS');

const config = require('../../../config/index');
const MineplexAPI = require('../../api/MineplexAPI');
const SamczsunAPI = require('../../api/SamczsunAPI');
const { punishments: { Punishment, Category, CategoryToReadable } } = require('../../api/SamczsunAPI');
const unauthorizedBanHandler = require('../unauthorized-ban-handler');
const transactions = require('../../items/transactions');

module.exports = function (MineplexSocket, slackBots) {
    MineplexSocket.on('punishmentAdd', punishment => {
        if (punishment.admin.name === 'Chiss') {
            //Handle system bans
            if (punishment.reason.startsWith('[GWEN')) {
                return;
                //Stop here because we're using a separate event
            } else if (punishment.reason.startsWith('Bot Spam')) {
                //It's a bot spam punishment... presumably.
                punishment.admin.name = 'BotSpam';
                punishment.admin.uuid = 'BotSpam';
            }
        } else if (punishment.admin.name === 'Spoobncoobr') {
            //Handle bans made by this bot
            if (punishment.reason.startsWith('Inappropriate Name')) {
                //It's an iname punishment... presumably.
                punishment.admin.name = 'InappropriateNameHandler';
                punishment.admin.uuid = 'INameHandler';
            } else if (punishment.reason.startsWith('Bot Spam')) {
                //It's a bot spam punishment... presumably. (Batched by me)
                punishment.admin.name = 'BotSpam';
                punishment.admin.uuid = 'BotSpam';
            }
        }

        if (punishment.admin.uuid) {
            transactions.incSpoobux(punishment.admin.uuid, config.spoobux.rewards.punish, err => {
                if (err) return log.error(`Unable to save spoobux for ${punishment.admin.name}: ${log.chalk.red(err)}`);
            });
        }

        const slackMessage = `*${punishment.admin.name}* issued a *${CategoryToReadable.get(punishment.category)}* Punishment to *${punishment.target.name}* for "${punishment.reason}". It ${(punishment.duration > 0) ? `will expire at \`${new Date(Date.now() + (punishment.duration * 60 * 60 * 1000)).toLocaleString()}\`` : 'will never expire.'} [*${punishment.server} | ${punishment.region}*]`;

        slackBots.MP.chat('pc-punish-add', slackMessage);
    });

    MineplexSocket.on('punishmentRemove', punishment => {
        function handleAuthorization(type) {
            function sendWarning(msg) {
                slackBots.MP.chat('pc-network-security', `:warning: A(n) *${type}* on *${punishment.target.name}* was removed by *${punishment.removeAdmin.name}*. :warning:\n${msg}`);
            }

            try {
                //Check if they're approved, first off
                if (config.punishments.approvedNames.indexOf(punishment.removeAdmin.name.toLowerCase()) > -1) {
                    sendWarning('They\'ve been approved to remove these kinds of punishments.');
                } else {
                    SamczsunAPI.methods.rank.get(punishment.removeAdmin.name).then(rank => {
                        //They have permission to remove it. Still notify people.
                        if (MineplexAPI.ranks.hasPermission('admin', rank)) {
                            sendWarning('They are Admin+, so I\'ve let them remove it.');
                        }
                        //It meets criteria for a NWB punishment (permaban)
                        else if (punishment.category === Category.PBAN) {
                            unauthorizedBanHandler.handle(slackBots.MP, punishment.removeAdmin.name, punishment, type);
                        }
                        //It meets no criteria, assumed to be ok.
                        else {
                            sendWarning('It doesn\'t fit my criteria for an unauthorized punishment removal.');
                        }
                    }).catch(e => {
                        //Couldn't get their rank :(
                        sendWarning(`I wasn't able to check their rank to see if they were allowed to remove it.\nError: \`${e}\``);
                    });
                }
            } catch (e) {
                sendWarning(`But I ran into an error: \`${e}\``);
            }

        }

        if (punishment.reason) {
            if (punishment.reason.toLowerCase().includes('network ban')) {
                handleAuthorization('Network Ban');
            } else if (punishment.reason.toLowerCase().includes('unauthorized punishment removal')) {
                handleAuthorization('Unauthorized Punishment Removal Ban');
            }
        }

        const slackMessage = `*${punishment.removeAdmin.name}* removed a punishment originally issued by *${punishment.admin.name}* from *${punishment.target.name}* for "${punishment.removeReason}". ID: \`${punishment.id}\` [*${punishment.server} | ${punishment.region}*]`;

        slackBots.MP.chat('pc-punish-remove', slackMessage);
    });
};