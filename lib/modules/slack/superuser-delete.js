const superusers = require('../../../config/commands').superuser;

module.exports = function (slackBot) {
    slackBot.api.on('reaction_added', event => {
        if (
            // If they want to remove the message...
            event.reaction === 'wastebasket'
        // And it is actually a message...
        && event.item.type === 'message'
        // And the original sender is the bot
        && event.item_user === slackBot.self.id
        ) {
            const user = slackBot.api.cache.users[event.user];

            if (superusers.includes(user.name)) {
                slackBot.api.methods.chat.delete({
                    ts: event.item.ts,
                    channel: event.item.channel
                }).catch(e => {
                    console.error('[SuperuserDelete] could not delete a message:');
                    console.error(e);
                });
            }
        }
    });
};