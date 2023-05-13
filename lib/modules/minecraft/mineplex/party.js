const PARTY_INVITE_REGEX = /^You have been invited to (.+?)\s*'s party!/;

module.exports = function (client) {
    client.on('mineplex-party', msg => {
        if (!PARTY_INVITE_REGEX.test(msg.text))
        {
            return;
        }

        const invitePlayer = PARTY_INVITE_REGEX.exec(msg.text)[1];

        client.chat(`/z deny ${invitePlayer}`)
            .catch(console.error);
    });
};
