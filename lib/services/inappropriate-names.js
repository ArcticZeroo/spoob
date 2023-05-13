const db            = require('../database/mongo/');
const { slackBots } = require('../modules/slack/bots');

function sendMessage(name, extra = '') {
    name = name.toLowerCase();

    return new Promise((resolve, reject) => {
        db.DetectedName.findOne({ name }, (err, res) => {
            // If it failed or the name
            // has already been reported
            if (err) {
                reject(err);
                return;
            }

            if (res) {
                reject('Name has already been reported.');
                return;
            }

            const DetectedName = new db.DetectedName({ name, at: Date.now() });

            DetectedName.save(err => {
                if( err) {
                    reject(err);
                    return;
                }

                slackBots.SENTRY.chat('rc-gwen-names', `\`${name}\` - \`@gwen iname ${name}\` ${extra}`).then(resolve).catch(reject);
            });
        });
    });
}

module.exports = { sendMessage };