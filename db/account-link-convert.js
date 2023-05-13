const Logger = require('frozor-logger');
const log = new Logger('CONVERTER');

const db = require('../lib/database/mongo/');

console.log('Account Converter v1');
db.mongoose.connection.on('open', () => {
    log.info('Searching for accounts...');
    db.Account.find({}, (err, accounts) => {
        if(err) {
            log.error(`Could not get accounts: ${err}`);
            return;
        }

        log.info(`Found ${log.chalk.cyan(accounts.length)} accounts.`);

        const removeReg = /-/g;

        async function convertOne(account) {
            return new Promise((resolve, reject) => {
                if (account.uuid.includes('-')) {
                    account.uuid = account.uuid.replace(removeReg, '');
                }

                if (typeof account.slack === 'string' || !Array.isArray(account.slack)) {
                    account.slack = [account.slack];
                }

                account.save(function (saveErr) {
                    if (saveErr) {
                        reject(saveErr);
                    } else {
                        resolve (saveErr);
                    }
                });
            });
        }

        async function convertAccounts() {
            log.info('Now converting accounts...');

            for (const account of accounts) {
                log.info(`Converting account for ${log.chalk.cyan(account.namelower)}`);
                await convertOne(account);
            }

            log.info('Converted all accounts!');
            process.exit();
        }

        convertAccounts().catch(e => {
            log.error(e);
        });
    }) ;
});