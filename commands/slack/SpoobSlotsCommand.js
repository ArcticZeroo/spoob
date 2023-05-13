const transactions = require('../../lib/items/transactions-promise');
const slots = require('../../lib/spoobux/games/slots');
const Collection = require('djs-collection');
const NumberUtil = require('../../lib/util/NumberUtil');

class SpoobSlotsCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'slots',
            aliases: ['slot', 'slotmachine'],
            auth: true
        });

        this.cooldown = new Collection();
    }

    async run(msg, bot, extra) {
        if (!msg.user.superuser && this.cooldown.has(extra.account.uuid)) {
            const last = this.cooldown.get(extra.account.uuid);

            const timeSince = Date.now() - last;

            if (timeSince < slots.COOLDOWN && timeSince > 1000) {
                const { time, units } = NumberUtil.getHumanReadable((slots.COOLDOWN - timeSince) / 1000);

                return msg.reply(`Sorry, but you can't play slots again for another *${time.toFixed(1)} ${units}*`);
            }
        }

        if (extra.account.spoobux < slots.COST) {
            return msg.reply(`Sorry, but you don't have enough Spoobux to play Slots! You need \`${slots.COST - extra.account.spoobux}\` more.`);
        }

        const items = slots.getSlotItems();

        const payout = slots.getPayout(items);

        const displacement = payout - slots.COST;

        let text = `*Spoob Slots*\n${slots.createSlotDisplay(items)} \n\n${
            displacement === 0 
                ? 'You broke even!' 
                : `You ${
                    displacement > 0 
                        ? 'gained' 
                        : 'lost'}`
        } *${Math.abs(displacement)}* Spoobux! \n\nYou now have \`${extra.account.spoobux + displacement}\` Spoobux.`;

        const crates = items.count(slots.Items.CRATE);

        if (crates > 0) {
            let wonId;
            let wonType = 'Crate';
            let extraText;

            if (crates === 1) {
                wonId = 3;
                wonType = 'Spoobox';
            } else if (crates === 2) {
                wonId = 142;
                wonType = 'Super Spoobox';
            } else if (crates === 3) {
                wonId = 143;
                wonType = 'Crazy Spoobox';
                extraText = '*250 bonus Spoobux*';

                await transactions.addSpoobux(extra.account, 250).catch(console.error);
            }

            text += `\nYou also won a *${wonType}*${extraText ? `, and ${extraText}` : ''}!`;

            try {
                await transactions.giveItem(extra.account, wonId);
            } catch (e) {
                console.error(e);
                text += ` However, something went wrong when giving the ${wonType} to you. You should tell someone.`;
            }
        }

        try {
            await transactions.addSpoobux(extra.account, displacement, true);

            this.cooldown.set(extra.account.uuid, Date.now());

            bot.chat(msg.channel, text);
        } catch (e) {
            console.error('[SLOTS] Could not save:');
            console.error(e);

            return msg.reply('Sorry, but I wasn\'t able to save your account. Please try again later.');
        }
    }
}

module.exports = SpoobSlotsCommand;