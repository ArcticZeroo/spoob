const Logger        = require('frozor-logger');
const log           = new Logger('HISTORY');
const PunishHistory = require('./../lib/Punish/PunishmentRecord');

let player = 'Artix';
if(process.argv.length >= 3) player = process.argv[2];

log.info('Making request...');
PunishHistory.getHistory(player, (success, result) => {
    if(!success ) return log.error('There was an error when making the request.');

    result.reverse();

    log.debug(JSON.stringify(result));

    result.forEach(punishment => {
        log.info(`${punishment.Category} Severity ${punishment.Severity} by ${punishment.Admin} on ${new Date(punishment.Time).toLocaleString()} - ${punishment.Reason} ${(punishment.Category != 'Warning') ? `[${(punishment.Active) ? 'Active' : (punishment.Removed) ? 'Removed' : 'Expired'}]` : ''}`);
    });
});