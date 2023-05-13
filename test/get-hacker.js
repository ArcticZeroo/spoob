const db       = require('../lib/database/mongo/');
const Logger   = require('frozor-logger');
const log      = new Logger();

const name = process.argv[2];
db.mongoose.connection.on('open', () => {
    db.Hacker.findOne({ username: name }, (err, res) => {
        if(err) log.error(`Unable to get hacker due to an error: ${log.chalk.red(err)}`);
        if(!res)log.info(`The user ${log.chalk.cyan(name)} was not found in the database.`);
        else    log.info(`Got stats for ${log.chalk.cyan(name)}: ${log.chalk.red(JSON.stringify(res.stats))}`);
        process.exit();
    });
});