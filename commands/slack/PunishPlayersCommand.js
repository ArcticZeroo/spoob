const SamczsunAPI = require('../../lib/api/SamczsunAPI');
const { punishments:{ Punishment, Category } } = SamczsunAPI;
const { SlackMessage } = require('frozor-slackbot');

const WAIT_TIME = 500;

class PunishPlayersCommand extends frozor.SlackCommand {
    constructor () {
        super ({
            name: 'punishplayers',
            allowedUsers: ['artix'],
            args: [new frozor.CommandArg('Targets', 'Comma-Separated String', true), new frozor.CommandArg('Category', 'String', true), new frozor.CommandArg('Severity', 'Number', true), ...frozor.CommandArg.getVariableArgs(256, 'Reason', 'String', true)]
        });
    }

    async run (msg, bot) {
        const reason = msg.args.slice(3).join(' ');
        if (reason.length > frozor.MAX_REASON_LENGTH) {
            return msg.reply(`Your reason must be less than *${frozor.MAX_REASON_LENGTH}* characters.`);
        }

        const category = msg.args[1];
        if (!Category.hasOwnProperty(category)) {
            return msg.reply(`Invalid punishment category! Valid categories:\n\`${Object.keys(Category).join(', ')}\``);
        }

        let severity = msg.args[2];
        if (isNaN(severity)) {
            return msg.reply('Invalid severity! Severity must be a number.');
        } 
        severity = parseInt(severity);
        

        const targets = msg.args[0].split(',');
        const totalToPunish = targets.length;
        const BASE_MESSAGE = `Punishing *${totalToPunish}* players...`;

        let response;
        try  {
            response = new SlackMessage(await bot.reply(msg, BASE_MESSAGE), bot);
        } catch (e) {
            console.error('Couldn\'t reply to a punishplayers request:');
            console.error(e);
            return;
        }

        let lastPunish = Date.now();
        const etaTimes = [];

        function getETA() {
            // Get the average by adding it all up and divide by the total amount
            const avgEta = etaTimes.reduce((a,b) => a+b) / etaTimes.length;

            // Add 1 second to compensate for the delay between, multiply by remaining to find an ETA, and fix it.
            return parseFloat((((avgEta + WAIT_TIME) * targets.length)/1000).toFixed(1));
        }

        function getPunishedRatio() {
            return `${totalToPunish - (targets.length)}/${totalToPunish}`;
        }

        function updateETA() {
            response.edit(`${BASE_MESSAGE}\n*Punished*: ${getPunishedRatio()}\n*ETA*: ${getETA().toHumanReadable(2)}`).catch(console.error);
        }

        function addPunish() {
            const now = Date.now();
            etaTimes.push(now - lastPunish);
            lastPunish = now;
        }

        const punishment = new Punishment({ target: 'hi mom!', category, severity, reason });

        while (targets.length > 0) {
            punishment.target.name = targets.shift();

            try {
                await punishment.punish();
                addPunish();
                updateETA();
            } catch (e) {
                console.error(e);
                return msg.reply(`Punished *${getPunishedRatio()}* players, but could not punish *${punishment.target.name}*: ${e}`);
            }

            await frozor.halt(WAIT_TIME);
        }

        msg.reply(`Successfully punished *${totalToPunish}* players.`);
    }
}

module.exports = PunishPlayersCommand;