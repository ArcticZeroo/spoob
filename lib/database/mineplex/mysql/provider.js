const { mainDatabase } = require('./index');
const { convert, RankType } = require('mineplex-ranks');
const StringUtil = require('../../../util/StringUtil');

async function retrieveAccountId(uuid) {
    try {
        const connection = await mainDatabase.getConnection();

        uuid = StringUtil.getUuid(uuid);

        const [rows] = await connection.execute('SELECT id FROM accounts WHERE accounts.uuid = ? LIMIT 1', [uuid])
            .finally(() => connection.release());

        if (rows.length < 1) {
            throw new Error('No rows returned.');
        }

        const row = rows[0];

        if (!row.id) {
            throw new Error('Row does not have account ID');
        }

        return row.id;
    } catch (e) {
        throw e;
    }
}

async function retrieveGroupsForAccountId(id) {
    try {
        const connection = await mainDatabase.getConnection();

        const [rows] = await connection.execute('SELECT * FROM accountRanks WHERE accountId=?;', [id])
            .finally(() => connection.release());

        if (rows.length < 1) {
            throw new Error('No rows returned.');
        }

        const result = { primary: null, additional: [] };

        for (const row of rows) {
            const { primaryGroup, rankIdentifier } = row;

            if (primaryGroup) {
                if (rankIdentifier === 'NULL') {
                    continue;
                }

                result.primary = convert(rankIdentifier, RankType.PRIMARY);
            } else {
                // Additional ranks do not have to be primary
                result.additional.push(convert(rankIdentifier));
            }
        }

        return result;
    } catch (e) {
        throw e;
    }
}

module.exports = { retrieveAccountId, retrieveGroupsForAccountId };