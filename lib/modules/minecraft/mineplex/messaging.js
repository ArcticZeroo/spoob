module.exports = function addMessagingMethods(client) {
    client.mineplex.message = function (player, message) {
        return client.chat(`/m ${player} ${message}`);
    };

    client.mineplex.staffMessage = function (player, message) {
        return client.chat(`/ma ${player} ${message}`);
    };

    client.mineplex.staffChat = function (message) {
        return client.chat(`/a ${message}`);
    };

    client.mineplex.resend = function (message) {
        return client.chat(`/r ${message}`);
    };

    client.mineplex.resendStaff = function (message) {
        return client.chat(`/ra ${message}`);
    };
};