const config = require('../../../config/gwen');

const TYPE_REGEX = /(\w+)\s*type\s*(\w+)/i;

// Hacks which are allowed to display their original name
const HACK_DISPLAY_ALLOWED = ['speed', 'timer'];

// Map specific hack names to other names...
const HACK_DISPLAY_MAP = {
    badpackets: 'Regen',
    glide: 'Flight',
    headroll: 'Illegal Movement',
    toggle: 'Sneak'
};

// Map kill aura names to all types associated with them.
// Yeah it's backwards from the other maps.
const KILL_AURA_MAP = {
    'Kill Aura': ['a', 'd', 'e', 'f', 'g'],
    'High CPS': ['b'],
    'Reach': ['c']
};

// Map strings which the hack should include to a given name.
const HACK_INCLUDES_MAP = {
    fastbow: 'FastBow',
    killaura(violation) {
        for (const killauraDisplay of Object.keys(KILL_AURA_MAP)) {
            if (KILL_AURA_MAP[killauraDisplay].includes(violation.type.toLowerCase())) {
                return killauraDisplay;
            }
        }
    }
};

class Violation {
    /**
     * Initialize this violation with data from the socket.
     * @param {object} data - Socket data to initialize this with
     * @param {string} data.player - The player name associated with this violation
     * @param {string} data.hack - The internal hack name associated with this violation
     * @param {number} data.violations - The vl associated with this violation
     * @param {string} data.server - The server  associated with this violation
     * @param {string} data.region - The region associated with this violation
     */
    constructor(data) {
        /**
         * The name of the player who received this violation
         * @type {string}
         * @property Violation.player
         */
        this.player = data.player;

        /**
         * The region the player received this violation on
         * @type {string}
         * @property Violation.region
         */
        this.region = data.region.toLowerCase();

        /**
         * The internal hack name this violation was given for.
         * <p>
         * This name is unmodified when the hack is a derivative type
         * such as killaura.
         * @type {string}
         * @property Violation.fullHack
         */
        this.fullHack = data.hack;

        /**
         * The internal hack name this violation was given for.
         * <p>
         * If it's a derivative of Killaura, this will simply be Killaura.
         * Check {@link Violation.type} for the killaura type.
         * @type {string}
         * @property Violation.hack
         */
        this.hack = data.hack;

        /**
         * The hack subtype, if applicable for this violation.
         * <p>
         * This is only used when the hack is killaura.
         * @type {string}
         * @property Violation.type
         */
        this.type = null;

        /**
         * The amount of violation points this violation is worth.
         * @type {number}
         * @property Violation.vl
         */
        this.vl = data.violations;

        /**
         * The server on which the player received this violation
         * @type {string}
         * @property Violation.server
         */
        this.server = data.server;

        if (TYPE_REGEX.test(this.hack)) {
            const match = this.hack.match(TYPE_REGEX);

            this.hack = match[1];
            this.type = match[2];
        }

        /**
         * This violation's display name.
         * @type {string}
         * @property Violation.hackDisplay
         */
        this.hackDisplay = this._getHackDisplay();

        /**
         * This violation's readable severity.
         * @type {string}
         * @property Violation.severity
         */
        this.severity = this._getSeverity();
    }

    _getHackDisplay() {
        const lowerHack = this.hack.toLowerCase();

        // directly allowed hacks have first priority
        if (HACK_DISPLAY_ALLOWED.includes(lowerHack)) {
            return this.hack;
        }

        // next check if it has a direct display map
        if (HACK_DISPLAY_MAP.hasOwnProperty(lowerHack)) {
            return HACK_DISPLAY_MAP[lowerHack];
        }

        // and then iterate through all the inclusions
        for (const hackIncludes of Object.keys(HACK_INCLUDES_MAP)) {
            // if this hack includes the requested string...
            if (lowerHack.includes(hackIncludes)) {
                // get the mapping
                const mapping = HACK_INCLUDES_MAP[hackIncludes];
                const mappingType = typeof mapping;

                // if it's a direct mapping (ie a string), return it
                if (mappingType === 'string') {
                    return mapping;
                }

                // If the mapping is a function,
                if (mappingType === 'function') {
                    // call it
                    const mappingResult = mapping(this);

                    // if the mapping was successful return it
                    if (mappingResult) {
                        return mappingResult;
                    }
                }
            }
        }

        // unknown type
        return 'Unknown';
    }

    _getSeverity() {
        const type = (this.type || this.hack).toLowerCase();

        if (!config.severities.hasOwnProperty(type)) {
            return 'Unknown';
        }

        const { extreme, high, medium, low } = config.severities[type];

        if (extreme && this.vl >= extreme) {
            return 'Extreme';
        }

        if (high && this.vl >= high) {
            return 'High';
        }

        if (medium && this.vl >= medium) {
            return 'Medium';
        }

        if (low && this.vl >= low) {
            return 'Low';
        }

        return 'Harmless';
    }
}

module.exports = { Violation };