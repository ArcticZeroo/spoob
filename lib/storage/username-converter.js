const db = require('../database/mongo/');
const mojang = require('mojang');
const Collection = require('djs-collection');

const CACHE_TIME = 1000*60*60*24;
const cache = new Collection();

function makeEntry(data) {
    return {
        time: Date.now(),
        data
    };
}

function isEntryValid(entry) {
    return (Date.now() - entry.time) <= CACHE_TIME;
}

function getUuidFromDb(username) {
    return new Promise((resolve, reject) => {
        db.Account.findOne({ namelower: username.toLowerCase() }, (err, user) => {
            if (err) {
                reject(frozor.SpoobErrors.ACCOUNT_LOOKUP_ERROR);
                return;
            }

            if (!user) {
                reject(frozor.SpoobErrors.ACCOUNT_NOT_FOUND);
                return;
            }

            resolve(user.uuid);
        });
    });
}

function getUsernameFromDb(uuid) {
    return new Promise((resolve, reject) => {
        db.Account.findOne({ uuid }, (err, user) => {
            if (err) {
                reject(frozor.SpoobErrors.ACCOUNT_LOOKUP_ERROR);
                return;
            }

            if (!user) {
                reject(frozor.SpoobErrors.ACCOUNT_NOT_FOUND);
                return;
            }

            resolve(user.username);
        });
    });
}

async function getUuidFromMojang(username) {
    try {
        return (await mojang.username(username)).id;
    } catch (e) {
        throw e;
    }
}

async function getUsernameFromMojang(uuid) {
    try {
        const history = await mojang.history(uuid);

        return (history[history.length - 1]).name;
    } catch (e) {
        throw e;
    }
}

async function getUUID(username) {
    username = username.toLowerCase();

    for (const [uuid, entry] of cache) {
        if (entry.data === username) {
            if (isEntryValid(entry)) {
                return uuid;
            }

            break;
        }
    }

    let uuid;
    try {
        uuid = await getUuidFromDb(username);
    } catch (e) {
        try {
            uuid = await getUuidFromMojang(username);
        } catch (e) {
            throw e;
        }
    }

    cache.set(uuid, makeEntry(username));
    return uuid;
}

async function getUsername(uuid) {
    uuid = uuid.replace(/-/g, '');

    if (cache.has(uuid)) {
        const entry = cache.get(uuid);

        if (isEntryValid(entry)) {
            return entry.data;
        } 
        cache.delete(uuid);
        
    }


    let username;
    try {
        username = await getUsernameFromDb(uuid);
    } catch (e) {
        try {
            username = await getUsernameFromMojang(uuid);
        } catch (e) {
            throw e;
        }
    }

    username = username.toLowerCase();

    cache.set(uuid, makeEntry(username));
    return username;
}

module.exports = {
    getUUID,
    getUsername
};