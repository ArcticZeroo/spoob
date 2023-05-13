const log      = require('frozor-logger');
const database = require('../lib/database/mongo/');

database.mongoose.connection.on('open', () => {
    const Artix = new database.Account({ spoobux: 50 });
    Artix.setName('Artix');

    function logUserInfo() {
        log.info(`The user ${Artix.name} has ${Artix.spoobux} Spoobux.`);
    }

    logUserInfo();

    //Artix.addSpoobux(50);
    //logUserInfo();
    process.exit();
});