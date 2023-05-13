const { Violation } = require('./parsing');
const { addPlayer } = require('./memcache');
const inames = require('./inames');

const EVENT_NAME = 'violation';

module.exports = function (socket) {
    socket.on(EVENT_NAME, function (region, data) {
        const violation = new Violation(data);

        addPlayer(violation);

        inames.incoming(violation.player);
    });
};