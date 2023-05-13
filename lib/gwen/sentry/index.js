const handler = require('./handler');
const logging = require('./logging');

function init(socket) {
    handler(socket);
    logging.start();
}

module.exports = init;