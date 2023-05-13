const { Client } = require('iron-golem');

const config = require('../../../config/minecraft');

const moduleLoader = require('../moduleLoader');
// It's an array to ensure order is preserved
const modules = [
    require('./logging'),
    // Most of the modules will be here, since it's mp-specific
    require('./mineplex')
];

const clients = {
    US: new Client({
        username: config.account.username,
        password: config.account.password,
        server: config.server.us,
        prefix: 'US',
        sessionCache: true,
        loginTimeout: config.loginTimeout
    }),
    EU: new Client({
        username: config.account.username,
        password: config.account.password,
        server: config.server.eu,
        prefix: 'EU',
        sessionCache: true,
        loginTimeout: config.loginTimeout
    })
};

function registerEvents(client) {
    client.on('login', () => {
        client.log.info(`Successfully logged into ${client.log.chalk.cyan(client.options.server)}:${client.log.chalk.magenta(client.options.port)}`);
        client.log.debug(`Current connection status: ${client.status}`);
    });

    function restart(timeUntil = 15 * 1000) {
        // Ignore the call if another restart is pending
        if (client.restarting) {
            return;
        }

        client.restarting = true;

        client.log.warn('Restarting Minecraft client...');

        setTimeout(() => {
            client.init()
                .then(() => client.restarting = false)
                .catch(restart);
        }, timeUntil);
    }

    client.restart = restart;

    // If client was kicked due to a ban,
    // restart it in 30s.
    // Otherwise, restart in 15.
    client.on('kicked', text => {
        client.log.warn('Client was kicked...');
        if (text.toLowerCase().includes('ban')) {
            restart(30 * 1000);
        } else {
            restart();
        }
    });

    client.on('end', () => {
        client.log.warn('Client connection ended...');
        restart(2500);
    });

    client.on('error', e => {
        if (!(e.message || e || '').includes('FATAL')) return;

        client.log.warn('Client encountered an error...');
        restart(2500);
    });

    client.on('loginFail', () => {
        client.log.warn('Login failed...');
        restart(5 * 1000);
    });

    client.on('loginTimeout', () => {
        client.log.warn('Login timed out...');
        restart(5 * 1000);
    });

    setInterval(function () {
        if (!client.isOnline && !client.restarting) {
            client.log.warn('Client is not online or restarting...');
            restart(5 * 1000);
        }
    }, 5 * 60 * 1000);
}


function loadModules(client) {
    moduleLoader.load(modules, client);
}

async function initClient(client, clientType) {
    if (!client.region && clientType) {
        client.region = clientType;
    }

    try {
        // Start the client, so .bot is not null
        await client.init();
    } catch (e) {
        throw e;
    }

    // Load modules in case events needs to use them
    loadModules(client);

    client.log.info(`Logging into ${client.log.chalk.cyan(client.options.server)}:${client.log.chalk.magenta(client.options.port)}...`);

    // Register events!
    registerEvents(client);

    // Wait for this client to log in before continuing
    return client.waitForLogin();
}

async function init() {
    for (const clientType of Object.keys(clients)) {
        const client = clients[clientType];

        try {
            await initClient(client, clientType);
        } catch (e) {
            console.error(`Unable to start client of type ${clientType}:`);
            console.error(e);
        }
    }
}

function restartClients() {
    for (const client of Object.valuesGenerator(clients)) {
        client.restart();
    }
}

module.exports = { clients, init, initClient, restartClients };