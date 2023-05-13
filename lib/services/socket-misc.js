module.exports = function (MineplexSocket) {
    MineplexSocket.on('staging-update', nonce => log.debug(`Received a staging update with nonce ${log.chalk.cyan(nonce)}`));
};