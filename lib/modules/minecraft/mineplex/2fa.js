const speakeasy = require('speakeasy');

const config = require('../../../../config/minecraft');

function getToken() {
    return speakeasy.totp({
        secret: config.twoFactorSecret,
        encoding: 'base32'
    });
}

module.exports = function handleTwoFactor(client) {
    client.on('mineplex-2fa', msg => {
        if (!msg.text.toLowerCase().includes('authenticated')) {
            client.send(getToken()).catch(e => console.error('Could not send 2fa code:', e));
        }
    });
};