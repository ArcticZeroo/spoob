if (!global.frozor) global.frozor = {};

frozor.DEVELOPMENT = process.env.NODE_ENV === 'dev';

frozor.SpoobErrors = require('./error/SpoobErrors');

frozor.halt = frozor.wait = frozor.pause = ms => new Promise(resolve => setTimeout(resolve, ms));

frozor.MAX_REASON_LENGTH = 256;

frozor.setIntervalImmediate = function (callback, interval) {
    callback();
    return setInterval(callback, interval);
};

/**
 * This takes seconds and turns it into human readable time.
 * @example
 * // Returns "10 Seconds"
 * 10.toHumanReadable()
 * @example
 * // Returns "23.5 Hours"
 * 84600.toHumanReadable()
 * @param fix {number} [1] - The amount of decimal places to display in the resulting string.
 * @returns {string}
 */
Number.prototype.toHumanReadable = function (fix = 1) {
    let days, hours, minutes, seconds = this;

    if(seconds <= 60) return `${seconds.toFixed(fix)} seconds`;

    minutes = (seconds / 60).toFixed(fix);

    if(minutes <= 60) return `${minutes} minutes`;

    hours   = (minutes / 60 ).toFixed(fix);

    if(hours <= 60) return `${hours} hours`;

    return `${(hours/24).toFixed(fix)} days`;
};

Number.prototype.hoursToSeconds = function () {
    return this*60*60;
};

String.prototype.toUUID = function () {
    return this.replace(/(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/, '$1-$2-$3-$4-$5');
};

/**
 * Returns the values of all keys inside an object.
 * @param obj {object} - The object to get values from...
 * @returns {Array}
 */
Object.values = function (obj) {
    const vals = [];

    for(const key of Object.keys(obj)){
        vals.push(obj[key]);
    }

    return vals;
};

Object.valuesGenerator = function *(obj) {
    for (const key of Object.keys(obj)) {
        yield obj[key];
    }
};

/**
 * Returns an array with elements [key, value] from an object
 * @param obj {object} - The object to get entries from...
 * @returns {Array}
 */
Object.entries = function (obj) {
    const entries = [];

    for (const key of Object.keys(obj)) {
        entries.push([key, obj[key]]);
    }

    return entries;
};

/**
 * Whether or not the String CAN BE a valid minecraft name.
 * This does no actual checks so the name could still not exist.
 * @returns {boolean}
 */
String.prototype.isValidMinecraftName = function () {
    return /^($|[A-Z0-9_]{1,16})$/i.test(this);
};

/**
 * Whether or not the String CAN BE a valid slack user.
 * No validation, so the user could not actually exist.
 * @returns {boolean}
 */
String.prototype.isSlackUser = function(){
    return /<@[A-z0-9]{9,10}>/.test(this);
};

String.prototype.slackMentionToID = function(){
    return this.substring(2, this.length-1);
};

Array.prototype.random = function () {
    return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.count = function (v) {
    return this.filter(i => i === v).length;
};