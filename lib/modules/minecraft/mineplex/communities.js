const { StringUtil } = require('iron-golem');

// 10 seconds to timeout
const UPDATE_POSITION_TIMEOUT = 10 * 1000;

// Position updater
const POSITION_UPDATED_REGEX = /^You have updated (.{1,16})'s\s+role to (.+)$/;
const POSITION_ALREADY_SET_REGEX = /^(.{1,16}) is alredy a\s+(.+)$/;
const PLAYER_NOT_FOUND_REGEX = /^Unknown player:\s+(.{1,16})\s*$/;
const COMMUNITY_NOT_FOUND_REGEX = /^Unknown community:\s+(.{1,16})\s*$/;
const CALLER_NOT_MEMBER_REGEX = /^You are not a member of\s+(.{1,16})\s*$/;
const CALLER_NOT_LEADER_REGEX = /^You are not the leader of\s+(.{1,16})\s*$/;
const VALID_POSITIONS = ['colead'];

function updatePosition(client, player, communityName, position) {
    return new Promise((resolve, reject) => {
        player = player.toLowerCase().trim();

        if (!StringUtil.isValidMinecraftName(player)) {
            reject('Invalid player name.');
            return;
        }

        if (!VALID_POSITIONS.includes(position.toLowerCase())) {
            reject('Invalid community position. It may not be supported via commands.');
            return;
        }

        // Response does not include the com, so only allow one instance of this at a time
        const event = 'mineplex-communities-position-update';

        if (client.listenerCount(event) > 0) {
            reject('Someone else is waiting to update a player\'s community position.');
            return;
        }

        // Send the message, and then once it's sent start the timeout
        // if the message fails to send, reject obviously.
        client.send(`/com ${position} ${communityName} ${player}`).then(() => {
            const timeout = setTimeout(() => {
                client.removeAllListeners(event);
                reject(`${position} command timed out.`);
            }, UPDATE_POSITION_TIMEOUT);

            client.once(event, error => {
                clearTimeout(timeout);

                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            });
        }).catch(e => {
            reject(e);
        });
    });
}

module.exports = function injectCommunities (client) {
    client.on('mineplex-communities', msg => {
        const emit = e => client.emit('mineplex-communities-position-update', e);

        const { text } = msg;

        if (COMMUNITY_NOT_FOUND_REGEX.test(text)) {
            return emit('Community not found');
        }

        if (PLAYER_NOT_FOUND_REGEX.test(text)) {
            return emit('Player not found');
        }

        if (CALLER_NOT_MEMBER_REGEX.test(text)) {
            return emit('The client running this command is not a member of the community');
        }

        if (CALLER_NOT_LEADER_REGEX.test(text)) {
            return emit('The client running this command is not the leader of the community');
        }

        if (POSITION_ALREADY_SET_REGEX.test(text)) {
            return emit('The player already has that position');
        }

        if (POSITION_UPDATED_REGEX.test(text)) {
            return emit();
        }

        return emit(`Uknown response from command: ${text}`);
    });

    client.mineplex.communities = {};

    client.mineplex.communities.updatePosition = (player, community, position) => updatePosition(client, player, community, position);
};