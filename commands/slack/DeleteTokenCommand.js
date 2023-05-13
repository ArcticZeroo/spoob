const log = new (require('frozor-logger'))('DELETETOKEN');
const db = require('../../lib/database/mongo/');

class DeleteTokenCommand extends frozor.SlackCommand {
    constructor () {
        super({
            name: 'deltoken',
            aliases: ['deletetoken', 'removetoken'],
            args: [new frozor.CommandArg('Token/User', 'String')],
            allowedUsers: ['artix']
        });
    }

    async run (msg, bot, extra) {
        const toRemove = msg.args[0];

        db.AuthToken.findOne({ type: 'spoob', $or: [{
            account: toRemove
        }, {
            token: toRemove
        }, {
            account: toRemove.toSlackId()
        }] }, (err, token) => {
            if (err) {
                log.error(err);
                msg.reply('An unexpected error occurred while attempting to search for the token. Please try again later.');
            } else if (!token) {
                msg.reply('Could not find an auth token with the provided parameters.');
            } else {
                token.remove(err => {
                    if (err) {
                        log.error(err);
                        msg.reply('An unexpected error occurred while attempting to delete the auth token. Please try again later.');
                    } else {
                        msg.reply(`Successfully deleted an auth token for *${toRemove}*!`);
                    }
                });
            }
        });
    }
}

module.exports = DeleteTokenCommand;