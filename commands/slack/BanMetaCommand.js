const request = require('request');

const { Attachment, Field } = require('frozor-slack-attachments');

class BanMetaCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'banmeta',
            requiredRank: 'SR.MOD',
            allowedOrgs: ['MINEPLEX', 'QA'],
            args: [new frozor.CommandArg('username', 'String')]
        });
    }

    static makeRequest(getItem, getValue) {
        return new Promise((resolve, reject) => {
            request({
                uri: `https://frozor.io/get/gwen/${getItem}/${getValue}?apiKey=`,
                json: true
            }, (err, res, body) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (res.statusCode.toString()[0] !== '2') {
                    if (body.error) {
                        reject(`(Code ${res.statusCode}) ${body.error}`);
                    } else {
                        reject(res.statusCode);
                    }
                    return;
                }

                if (body.success === false || body.error) {
                    reject(body.error || 'An unexpected error occurred.');
                    return;
                }

                resolve(body);
            });
        });
    }

    async run(msg, bot) {
        if (!msg.superuser && bot.prefix === 'QA') {
            if (['pc-qa-team', 'gwen-help'].includes(bot.api.cache.groups[msg.channel].name)) {
                return msg.reply('Sorry, you can\'t use that command here.');
            }
        }

        // If it's not a valid MC name, it can't possibly be a valid token...
        if (!msg.args[0].isValidMinecraftName()) {
            return msg.reply('Hmm, that doesn\'t look like a Minecraft name to me. Try again?');
        }

        // So let's now check if it's a player.
        let token;
        try {
            const { tokens } = await BanMetaCommand.makeRequest('tokens', msg.args[0]);

            if (!tokens) {
                return msg.reply('Huh. Something went really wrong. That shouldn\'t have happened. Try again?');
            }

            if (tokens.length === 0) {
                return msg.reply('It looks like that player doesn\'t have any GWEN punishments.');
            }

            token = tokens[tokens.length-1];
        } catch (e) {
            if (e.toString().includes('does not exist')) {
                return msg.reply('Hmm, it doesn\'t look like that player exists. Have they changed their name?');
            } 
            console.error('BanMetaCommand token error:');
            console.error(e);
            return msg.reply('An unexpected error occurred while attempting to look up that player\'s tokens. Please try again later.');
            
        }

        let meta;
        try {
            const res = await BanMetaCommand.makeRequest('meta', token);
            meta = res.meta;
        } catch (e) {
            if (e.toString().includes('no such meta')) {
                return msg.reply('That\'s odd, it seems that the token I _just looked up_ doesn\'t exist. You should tell someone about this.');
            } 
            console.error('BanMetaCommand meta error:');
            console.error(e);
            return msg.reply('An unexpected error occurred while attempting to load the ban meta. Please try again later.');
            
        }

        meta.violations.sort((a, b) => b.max - a.max);

        const attachment = new Attachment()
            .setTitle(`[GWEN Ban Metadata] Token: ${token}`)
            .setTitleLink(`https://frozor.io/gwen/meta/${token}`)
            .setColor('#2196F3')
            .addMarkdownField('title')
            .addMarkdownField('fields')
            .addField(
                new Field()
                    .setTitle('Player')
                    .setValue(meta.name)
                    .setShort(true)
            )
            .addField(
                new Field()
                    .setTitle('Ban Reason')
                    .setValue(meta.isBanwave ? 'Banwave - Unknown' : meta.banReason || 'Unknown')
                    .setShort(true)
            )
            .addField(
                new Field()
                    .setTitle('Server')
                    .setValue(`*${meta.server.region}* ${meta.server.name}`)
                    .setShort(true)
            )
            .addField(
                new Field()
                    .setTitle('Highest VL')
                    .setValue(`${meta.violations[0].hack} - ${meta.violations[0].max} Max VL (${meta.violations[0].total} Total)`)
                    .setShort(true)
            );

        bot.chat(msg.channel, '', { attachments: [attachment] });
    }
}

module.exports = BanMetaCommand;