const ExpiringCache  = require('expiring-cache');

/*
MySQL Database Rank Storage requires...
const mongoDb = require('../database/mongo');
const nameConverter = require('./username-converter');
const mySqlProvider = require('../database/mineplex/mysql/provider');
const MongoUtil = require('../util/MongoUtil');
*/

// Inaccurate MSSQL rank storage requires...
const SamczsunAPI = require('../api/SamczsunAPI');
const { convert } = require('mineplex-ranks');

const Logger = require('frozor-logger');
const log = new Logger('RANKCACHE');

class LowercaseCache extends ExpiringCache {
    /**
     * Get rank data for a given player
     * @param {string} key - The player's name
     * @return {Promise.<object>}
     */
    getEntry(key) {
        log.debug(`Getting rank for player ${key}`);

        return super.getEntry(key.toLowerCase());
    }

    hasValid(key) {
        return super.hasValid(key.toLowerCase());
    }
}

/*const rankCache = new LowercaseCache(async username => {
    let account;
    try {
        account = await mongoDb.Account.findOne({ namelower: username.toLowerCase() }).exec();
    } catch (e) {
        // If we can't get the account that's OK,
        // we'll get the remaining data below
        console.error(e);
    }

    let accountId;
    if (account && account.mineplex && account.mineplex.accountId) {
        log.debug('Inferring account ID from database account');
        accountId = account.mineplex.accountId;
    } else {
        let uuid;
        if (account && account.uuid) {
            log.debug('Inferring UUID from database account');
            uuid = account.uuid;
        } else {
            log.debug('Getting UUID from mojang');
            try {
                uuid = await nameConverter.getUUID(username);
            } catch (e) {
                throw e;
            }
            log.debug(`Got UUID: ${uuid}`);
        }

        log.debug('Getting account ID from mysql');
        try {
            accountId = await mySqlProvider.retrieveAccountId(uuid);
        } catch (e) {
            throw e;
        }

        log.debug(`Got an account ID: ${accountId}`);

        if (account) {
            log.debug('Saving database account...');
            if (!account.mineplex) {
                account.mineplex = {};
            }

            account.mineplex.accountId = accountId;

            account.markModified('mineplex');

            try {
                await MongoUtil.save(account);
            } catch (e) {
                // saving the account id is not
                // strictly necessary to get the
                // rank as long as we got it fine
                console.error(e);
            }
            log.debug('Saved');
        }
    }


    log.debug('Getting rank info from mysql');
    let rankInfo;
    try {
        rankInfo = await mySqlProvider.retrieveGroupsForAccountId(accountId);
    } catch (e) {
        throw e;
    }
    log.debug(`Got it! ${JSON.stringify(rankInfo)}`);

    return rankInfo;
});*/

const rankCache = new LowercaseCache(async username => {
    let primaryRank;
    try {
        primaryRank = await SamczsunAPI.methods.rank.get(username);
    } catch (e) {
        throw e;
    }

    return { primary: convert(primaryRank), additional: [] };
});

module.exports = rankCache;