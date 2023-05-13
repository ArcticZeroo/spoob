const config = require('../../../config/gwen');
const { cache, regions, clear: clearCache } = require('./memcache');
const { slackBots } = require('../../modules/slack/bots');

const FILTERS = {
    type(...types) {
        return violation => types.includes((violation.type || violation.hack).toLowerCase());
    },

    severity(...severities) {
        return violation => severities.includes(violation.severity.toLowerCase());
    }
};

const SENTRIES = {
    US: { regions: ['us'], channel: config.channels.sentry_us }, EU: { regions: ['eu'], channel: config.channels.sentry_eu },

    NDA: {
        limit: Number.POSITIVE_INFINITY,
        verbose: true,
        workspace: 'MP',
        title: 'Verbose',
        channel: 'gwen-sentry'
    },

    EXTREME: {
        filters: [FILTERS.severity('extreme')],
        title: 'Extreme',
        channel: 'gwen-sentry-extreme'
    },

    PROPHET: {
        filters: [FILTERS.type('c', 'e')],
        channel: 'gwen-sentry-prophet',
        workspace: 'MP',
        verbose: true
    }
};

const SEVERITY_EMOJI = {
    'high': ':heavy_exclamation_mark:',
    'extreme': ':warning:'
};

const MARKDOWN = {
    bold(text) {
        return `*${text}*`;
    },

    italics(text) {
        return `_${text}_`;
    },

    code(text) {
        return `\`${text}\``;
    }
};

const FORMATTERS = {
    HEADER_EMOJI: ':crossed_swords:',

    title({ region, options }) {
        region = region.toUpperCase();

        if (options.title) {
            return `${options.title} ${region}`;
        }

        return region;
    },

    count({ options, players, count }) {
        const message = `Top ${count} Violations`;

        if (options.limit === Number.POSITIVE_INFINITY || players.length === count) {
            return message;
        }

        return `${message} (Out of ${players.length})`;
    },

    header({ region, options, players, count }) {
        return [
            [FORMATTERS.HEADER_EMOJI, `*GWEN Sentry ${FORMATTERS.title({ region, options })}*`, FORMATTERS.HEADER_EMOJI].join(' '),
            `${FORMATTERS.count({ options, players, count })}:`
        ];
    },

    player: {
        name(violation) {
            return MARKDOWN.code(violation.player);
        },
        hack(hackName) {
            return MARKDOWN.bold(hackName);
        },
        server(violation) {
            return MARKDOWN.code(violation.server);
        },
        hackSeverity(violation) {
            const message = `${violation.severity} Severity`;
            const lowerSev = violation.severity.toLowerCase();

            if (!SEVERITY_EMOJI.hasOwnProperty(lowerSev)) {
                return message;
            }

            const emoji = SEVERITY_EMOJI[lowerSev];

            return [emoji, message, emoji].join(' ');
        },
        position(i) {
            return `${i + 1}: `;
        },

        staff(i, violation) {
            return [
                FORMATTERS.player.position(i) + FORMATTERS.player.name(violation),
                `${FORMATTERS.player.hack(violation.hackDisplay)} ${FORMATTERS.player.hackSeverity(violation)}`,
                FORMATTERS.player.server(violation)
            ];
        },
        verbose(i, violation) {
            return [
                FORMATTERS.player.position(i) + FORMATTERS.player.name(violation),
                `${FORMATTERS.player.hack(violation.fullHack)} ${violation.vl}VL (${violation.severity} Severity)`,
                FORMATTERS.player.server(violation)
            ];
        },
        row(i, violation, options) {
            if (options.verbose) {
                return FORMATTERS.player.verbose(i, violation);
            }

            return FORMATTERS.player.staff(i, violation);
        }
    }
};

/**
 * Build a gwen message, given the full player list and a set of options.
 * @param {string} region - The current region this is building a message for
 * @param {Array.<Violation>} players - A list of all violations, to be filtered.
 * @param {object} options - Options to use for sending this message.
 * @returns {string|null} - the gwen message, or null if no message should be sent
 */
function buildGwenMessage(region, players, options) {
    for (const filter of options.filters) {
        players = players.filter(filter);
    }

    if (!players.length) {
        return null;
    }

    const count = Math.min(options.limit, players.length);

    const limitedPlayers = players.slice(0, count);

    const parts = [
        ...FORMATTERS.header({ region, options, players, count })
    ];

    for (let i = 0; i < limitedPlayers.length; i++) {
        parts.push(FORMATTERS.player.row(i, limitedPlayers[i], options).join(' - '));
    }

    return parts.join('\n');
}

async function sendGwenMessages() {
    const playersByRegion = {};

    for (const region of regions) {
        playersByRegion[region] = Array.from(cache[region].values()).sort((a, b) => b.vl - a.vl);
    }

    for (const sentry of Object.valuesGenerator(SENTRIES)) {
        const options = Object.assign({
            regions,
            limit: config.users_per_message,
            filters: [],
            verbose: false,
            workspace: 'SENTRY'
        }, sentry);

        if (!slackBots.hasOwnProperty(options.workspace.toUpperCase())) {
            continue;
        }

        const bot = slackBots[options.workspace.toUpperCase()];

        for (const region of options.regions) {
            if (!playersByRegion.hasOwnProperty(region)) {
                continue;
            }

            if (!playersByRegion[region].length) {
                continue;
            }

            try {
                const message =  buildGwenMessage(region, playersByRegion[region], options);

                if (!message) {
                    continue;
                }

                await bot.chat(options.channel, message);
            } catch (e) {
                console.error('Unable to send a gwen sentry message:');
                console.error(e);
            }
        }
    }

    clearCache();
}

function start() {
    setInterval(sendGwenMessages, config.time_between_messages * 1000);
}

module.exports = { start };