module.exports = function handleCommands(client) {
    const prefixes = ['-gwen', '-spoob', '@gwen', '@spoob'];

    function handlePrefixed(msg) {
        if (msg.args[0] && prefixes.includes(msg.args[0].toLowerCase())) {
            if (msg.args.length < 2) {
                return;
            }

            msg.commandName = msg.args[1].toLowerCase();

            msg.args.splice(0, 2);

            client.emit('command', msg);
        }
    }

    function handleDirect(msg) {
        if (msg.args.length < 1) {
            return;
        }

        msg.commandName = msg.args.shift().toLowerCase();

        if (prefixes.includes(msg.commandName)) {
            handleDirect(msg);
            return;
        }

        client.emit('command', msg);
    }

    client.on('private-message', handleDirect);
    client.on('staff-message-receive', handleDirect);

    client.on('staff-chat', handlePrefixed);
    client.on('chat', handlePrefixed);
};