require('../lib/defs');

const Logger = require('frozor-logger');
const log = new Logger('PUNISH');

const SamczunAPI = require('../lib/api/SamczsunAPI');
const { endpoint } = SamczunAPI;
const { Punishment, Category, CategoryToReadable } = SamczunAPI.punishments;

const name = (process.argv.length >= 3) ? process.argv[2] : 'CubedToast';

log.info(`Getting history for ${log.chalk.cyan(name)}...`);

endpoint.getPunishments(name).then(punishments => {
    const pastOffenses = Punishment.getPastOffenses(punishments);

    function getDuration(category, severity) {
        return Punishment.getDuration(category, severity, pastOffenses);
    }

    log.info('----------------');
    log.info('');
    log.info(`${log.chalk.cyan(name)} has ${log.chalk.red(punishments.length)} punishments.`);
    log.info(`${log.chalk.red(punishments.filter(punishment => !punishment.removed).length)} of those are unremoved, and ${log.chalk.red(punishments.filter(punishment => punishment.active).length)} are currently active.`);
    log.info('');
    log.info('----------------');
    log.info('');
    log.info(`Punishment times for ${log.chalk.cyan(name)}:`);
    log.info('');
    log.info('----------------');

    for(const category of Object.values(Category)){
        for(let i = 1; i <= 4; i++){
            let duration = getDuration(category, i);
            if(duration == -1){
                duration = 'Permanent';
            }else{
                duration = duration.hoursToSeconds().toHumanReadable(1);
            }

            log.info(`Duration for ${log.chalk.cyan(CategoryToReadable.get(category))} Severity ${log.chalk.magenta(i)}: ${log.chalk.red(duration)}`);
        }
    }
}).catch(e => {
    log.error(`Could not get punishments for ${log.chalk.cyan(name)}: ${log.chalk.red(e)}`);
});