const moduleLoader = require('../../moduleLoader');

const mineplexModules = [
    // prefixedMessages needs to run first, so everything else can use it
    require('./prefixedMessages'),
    // twoFactor needs to load next, since nothing else can run before authed
    require('./2fa'),
    // Load portal next, so the client is in the right server and has current server available.
    require('./portal'),
    // Find is next, because we need portal to get current server.
    require('./find'),
    // And other various modules that listen to chat, but don't really need custom chat.
    require('./restart'),
    require('./filter'),
    require('./time'),
    require('./party'),
    require('./teleport'),
    require('./communities'),
    // Load customChat next so it parses args and adds a .user prop
    require('./customChat'),
    // And commands next, since it needs those things
    require('./commands')
];

module.exports = function (client) {
    client.mineplex = {};

    moduleLoader.load(mineplexModules, client);
};