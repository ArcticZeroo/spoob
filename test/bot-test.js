const Logger     = require('frozor-logger');
const log        = new Logger();
const mineflayer = require('mineflayer');

log.info('Logging in');

const bot        = mineflayer.createBot({
    username: '',
    password: '',
    host    : 'us.mineplex.com'
});

bot.on('login', () => {
    log.info('Logged in');
});