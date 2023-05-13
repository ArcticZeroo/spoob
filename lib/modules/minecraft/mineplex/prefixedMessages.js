module.exports = function (client) {
    client.on('server-message', msg => {
        client.emit(`mineplex-${msg.prefix.toLowerCase()}`, msg);
    });
};