const EventEmitter = require('events');
const dns = require('dns');
const { promisify } = require('util');
const dnsLookup = promisify(dns.lookup);

const hermes = require('mc-hermes');
const mojang = require('mojang');
const Collection = require('djs-collection');

const { slackBots } = require('../modules/slack/bots');

const MojangService = {
    SESSIONS: 'session.minecraft.net',
    ACCOUNTS: 'account.mojang.com',
    AUTH: 'auth.mojang.com'
};

const MojangStatus = {
    UP: 'green',
    SLOW: 'yellow',
    DOWN: 'red'
};

const ConvertMojangStatus = {
    [MojangStatus.UP]: 'UP',
    [MojangStatus.SLOW]: 'SLOW',
    [MojangStatus.DOWN]: 'DOWN',
    [undefined]: 'UNKNOWN'
};

function getMojangStatusEmoji(status, service) {
    switch (status[service]) {
        case MojangStatus.UP:
            return ':heavy_check_mark:';
        case MojangStatus.SLOW:
            return ':snail:';
        case MojangStatus.DOWN:
            return ':x:';
    }

    return ':question:';
}

class Ping {
    constructor(count, success, mojangStatus) {
        this.time = Date.now();
        this.count = count;
        this.success = success;
        this.mojangStatus = mojangStatus;
    }
}

class Server extends EventEmitter {
    constructor(name, server, port, type) {
        super();

        this.name = name;
        this.server = server;
        this.port = port;
        this.type = type;
        this.manualResolve = false;

        this.pings = new Collection();

        this.mentions = [];
        this.takeMojangStatus = true;
        this.pingAttempts = 2;
        this.playerMaxDisplacement = 150;
        this.playerMinDisplacement = 75;
        this.playerMinMult = 0.1;
    }

    async ping() {
        let server = this.server;
        if (this.manualResolve) {
            try {
                const lookup = await dnsLookup(this.server);

                if (typeof lookup === 'string') {
                    server = lookup;
                } else if (lookup.address) {
                    server = lookup.address;
                } else {
                    throw new Error('Could not resolve IP; no valid address returned');
                }
            } catch (e) {
                throw e;
            }
        }

        try {
            const data = await hermes({ server, port: this.port, type: this.type });

            return data.players.online;
        } catch (e) {
            e.mineplex = { server };

            throw e;
        }
    }

    async pingWithAttempts(attempts = this.pingAttempts) {
        try {
            return await this.ping();
        } catch (e) {
            if (attempts) {
                return this.pingWithAttempts(--attempts);
            }

            throw e;
        }
    }

    /**
     * The most recent ping.
     * @type {Ping}
     * @readonly
     */
    get lastPing() {
        const keys = this.pings.keyArray();

        // Return the value of the last ping, which is
        // grabbed with the last key.
        return this.pings.get(keys[keys.length - 1]);
    }

    get lastTwo() {
        const keys = this.pings.keyArray();

        const newer = this.pings.get(keys[keys.length - 1]);
        const older = this.pings.get(keys[keys.length - 2]);

        return { newer, older };
    }

    get displacement() {
        if (this.pings.size === 0) {
            return 0;
        }

        if (this.pings.size === 1) {
            return this.lastPing.count;
        }

        const { newer, older } = this.lastTwo;

        return newer.count - older.count;
    }

    get timeDisplacement() {
        if (this.pings.size === 0) {
            return 0;
        }

        if (this.pings.size === 1) {
            return Server.BASE_TIMEOUT;
        }

        const { newer, older } = this.lastTwo;

        return newer.time - older.time;
    }

    /**
     * Whether displacement is excessive.
     * By default, this method checks whether
     * 500 players OR 10% of players, OR 100 players
     * (if 10% is <100) have been lost.
     * have been lost since the last ping.
     * @type {boolean}
     * @readonly
     */
    get isDisplacementExcessive() {
        return -this.displacement > Math.max(Math.min(this.lastPing.count * this.playerMinMult, this.playerMaxDisplacement), this.playerMinDisplacement);
    }

    getDisplacementAsPercentage() {
        if (this.pings.size < 2) {
            return '100.00';
        }

        const { newer, older } = this.lastTwo;

        return (Math.abs((newer.count - older.count) / older.count) * 100).toFixed(2);
    }

    getDisplacementWord() {
        return this.displacement < 0 ? 'lost' : 'gained';
    }

    async doPingCheck() {
        let mojangStatus;
        if (this.takeMojangStatus) {
            try {
                mojangStatus = await mojang.status();
            } catch (e) {
                // Do nothing, I guess.
            }
        }

        const lastPing = this.lastPing;

        let count;
        try {
            count = await this.pingWithAttempts();

            const ping = new Ping(count, true, mojangStatus);

            this.pings.set(ping.time, ping, lastPing);

            /**
             * @event Server#pingSuccess
             * @param {Ping} ping - The most recent ping.
             * @param {Ping} lastPing - The last ping for this Server
             */
            this.emit('pingSuccess', ping, lastPing);
        } catch (err) {
            console.error(`Pinging error for ${this.name}:`);
            console.error(err);

            const ping = new Ping(count, false, mojangStatus);

            this.pings.set(ping.time, ping);

            /**
             * Emitted when a ping fails after multiple attempts.
             * @event Server#pingFail
             * @param {Ping} lastPing - The last ping for this Server.
             * @param {Error} err - The error causing the ping to fail.
             */
            this.emit('pingFail', lastPing, err);
        }

        this.emit('pingAttempt', this.lastPing);
    }

    static sendNotification(text) {
        return slackBots.MP.chat('network-911', text);
    }

    send911(extra = [], sendCount = true, mentions = this.mentions) {
        const lines = [];

        lines.push(`:fire: A possible *${this.name}* network disruption has been detected :fire_engine:`);

        if (sendCount) {
            lines.push(`*Details:* \`${Math.abs(this.displacement)}\` players (\`${this.getDisplacementAsPercentage()}%\`) have been ${this.getDisplacementWord()} since the last ping *${(this.timeDisplacement / 1000).toHumanReadable()}* ago, which was *${(this.lastPing.success) ? 'Successful' : 'Unsuccessful'}*`);
        }

        if (typeof extra === 'string') {
            lines.push(extra);
        } else {
            lines.push(...extra);
        }

        if (mentions.length) {
            lines[lines.length - 1] += `\n${mentions.join(' ')}`;
        }

        return Server.sendNotification(lines.join('\n\n'));
    }
}

Server.BASE_TIMEOUT = 5 * 60 * 1000;

const Mentions = {
    KENNY: '<@U0V33B35K>',
    ALEX: '<@U0AFUSBNX>',
    RYAN: '<@U0BM56WLT>',
    BRIAN: '<@U7N1HCMJ4>'
};

class JavaServer extends Server {
    constructor(name, server, port = 25565) {
        super(name, server, port, 'pc');

        this.manualResolve = true;
        this.mentions.push(Mentions.ALEX);
    }
}

class BedrockServer extends Server {
    constructor(name, server, port = 19132) {
        super(name, server, port, 'pe');

        this.mentions.push(Mentions.BRIAN);

        // Don't need to take mojang status
        // since auth is either custom or xbl
        this.takeMojangStatus = false;

        this.playerMaxDisplacement = 1500;
    }
}

const servers = {
    java: {
        MineplexUS: new JavaServer('Java (US/EU)', 'us.mineplex.com'),
        Comparison: new JavaServer('Hypixel', 'mc.hypixel.net')
    },
    bedrock:  {
        Mineplex: new BedrockServer('Bedrock (US)', 'pe.mineplex.com'),
        Zott: new BedrockServer('Zott', 'zott.mineplex.com'),
        //MineplexMCO: new BedrockServer('Bedrock (MCO/LBETA)', 'mco.mineplex.com')
    }
};

servers.bedrock.Zott.mentions.push(Mentions.RYAN);

function startJava() {
    const mineplex = servers.java.MineplexUS;
    const comparison = servers.java.Comparison;

    mineplex.on('pingSuccess', function (newPing, oldPing) {
        if (mineplex.isDisplacementExcessive) {
            const extra = [];

            const { newer: comparisonNewer, older: comparisonOlder } = comparison.lastTwo;

            if (comparisonNewer.success && comparisonOlder.success) {
                extra.push(`In comparison, *${comparison.name}* ${comparison.getDisplacementWord()} \`${Math.abs(comparison.displacement)}\` players in *${(comparison.timeDisplacement / 1000).toHumanReadable()}*.`);
            } else {
                extra.push(`The comparison server *${comparison.name}* was unable to ping at least once recently, so a player displacement cannot be established.`);
            }

            if (!newPing.mojangStatus) {
                extra.push('Mojang status could not be pinged. This may be the cause of the drop.');

                return mineplex.send911(extra, true, []);
            }

            const mojangStatus = [];

            mojangStatus.push(`Sessions: ${getMojangStatusEmoji(newPing.mojangStatus, MojangService.SESSIONS)}`);
            mojangStatus.push(`Accounts: ${getMojangStatusEmoji(newPing.mojangStatus, MojangService.ACCOUNTS)}`);
            mojangStatus.push(`Auth: ${getMojangStatusEmoji(newPing.mojangStatus, MojangService.AUTH)}`);

            extra.push(mojangStatus.join('\n'));

            // If sessions are not up, don't mention anyone.
            if (newPing.mojangStatus[MojangService.SESSIONS] !== MojangStatus.UP) {
                extra.push('Sessions are the likely cause for this drop.');

                mineplex.send911(extra, true, []);
            } else {
                mineplex.send911(extra);
            }
        }
    });

    mineplex.on('pingFail', function (lastPing, err) {
        if (!lastPing || lastPing.success) {
            mineplex.send911([
                `Unable to ping *${mineplex.name}* after multiple attempts${err.mineplex && err.mineplex.server ? ` with resolved IP ${err.mineplex.server}` : ''}.`,
                `*Error:* ${err.message || err || 'Unknown'}`
            ], false);
        }
    });

    mineplex.on('pingAttempt', function () {
        const { newer, older } = mineplex.lastTwo;

        if (older && older.mojangStatus) {
            if (older.mojangStatus[MojangService.SESSIONS] !== MojangStatus.UP) {
                // If mojang status is currently UP
                if (newer.mojangStatus && newer.mojangStatus[MojangService.SESSIONS] === MojangStatus.UP) {
                    // notify people that it's up
                    Server.sendNotification('*Java* sessions appear to be back up!');
                }
            }
            else {
                // mojang status is currently down
                if (newer.mojangStatus && newer.mojangStatus[MojangService.SESSIONS] !== MojangStatus.UP) {
                    // It wasn't down before, so notify people it just went down
                    Server.sendNotification(`*Java* sessions appear to ${newer.mojangStatus[MojangService.SESSIONS] === MojangStatus.DOWN ? 'have gone down' : 'have slowed down'} :disappointed: :shake_fist: :mojang:`);
                }
            }
        }

    });

    async function doJavaCheck() {
        // Nobody cares if Hypixel fails to ping, but we
        // want their counts anyways.
        await comparison.doPingCheck().catch(() => {});

        await mineplex.doPingCheck().catch(e => {
            console.error('Could not attempt to ping Java:');
            console.error(e);
        });

        /**
         * If the last ping was not excessive,
         * and the last ping was successful,
         * and mojangStatus is (not null and) UP,
         * set the regular timeout.
         *
         * Otherwise, set 3x the regular timeout.         */
        if (!mineplex.isDisplacementExcessive && mineplex.lastPing.success && (mineplex.lastPing.mojangStatus && mineplex.lastPing.mojangStatus[MojangService.SESSIONS] === MojangStatus.UP)) {
            setTimeout(timeoutCallback, Server.BASE_TIMEOUT);
        } else {
            setTimeout(timeoutCallback, Server.BASE_TIMEOUT * 3);
        }
    }

    function timeoutCallback() {
        doJavaCheck().catch(e => {
            console.error('Could not process a Java timeout callback: ');
            console.error(e);
        });
    }

    setTimeout(timeoutCallback, Server.BASE_TIMEOUT);
}

function startBedrock() {
    // No special handling for bedrock, just iterate.
    for (const server of Object.valuesGenerator(servers.bedrock)) {
        server.on('pingSuccess', () => {
            if (server.isDisplacementExcessive) {
                server.send911();
            }
        });

        server.on('pingFail', (lastPing, err) => {
            if (!lastPing || lastPing.success) {
                server.send911([`Unable to ping *${server.name}* after multiple attempts.`, `*Error:* ${(err || {}).message || err || 'Unknown'}`], false);
            }
        });

        async function doBedrockCheck() {
            await server.doPingCheck().catch(e => {
                console.error(`[PingCheck] Could not attempt to ping ${server.name}:`);
                console.error(e);
            });

            if (server.isDisplacementExcessive || !server.lastPing.success) {
                setTimeout(timeoutCallback, Server.BASE_TIMEOUT * 3);
            } else {
                setTimeout(timeoutCallback, Server.BASE_TIMEOUT);
            }
        }

        function timeoutCallback() {
            doBedrockCheck().catch(e => {
                console.error(`[Timeout] Could not attempt to ping ${server.name}:`);
                console.error(e);
            });
        }

        setTimeout(timeoutCallback, Server.BASE_TIMEOUT);
    }
}

startJava();
startBedrock();

module.exports = { servers };