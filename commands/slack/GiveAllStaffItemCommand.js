const { StringUtil } = require('iron-golem');

const { clients } = require('../../lib/modules/minecraft/client');

class GiveAllStaffItemCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'giveallstaffitem',
            allowedUsers: ['bluebeetlehd'],
            args: [
                {
                    name: 'count',
                    type: 'number'
                }
            ]
        });

        this.addInfiniteArgs('item name');
    }

    async run(msg) {
        const resolved = require.resolve('../../config/staff');
        const staffList = require(resolved);
        const client = clients.US;

        if (!client.isOnline) {
            return msg.reply('The US client is not currently online.');
        }

        const itemCount = parseInt(msg.args[0]);

        if (isNaN(itemCount)) {
            return msg.reply('That doesn\'t seem to be a valid number.');
        }

        const itemName = msg.args.slice(1).join(' ');
        const promises = [];

        promises.push(msg.reply(`Beginning awarding of item \`${itemName}\` for \`${staffList.length}\` user(s)...`));

        for (const staffName of staffList) {
            if (!StringUtil.isValidMinecraftName(staffName)) {
                promises.push(msg.reply(`Warning: Could not award items to player \`${staffName}\` because their name is invalid.`));
                continue;
            }

            promises.push(client.chat(`/giveitem ${staffName} ${itemCount} ${itemName}`));
        }

        try {
            await Promise.all(promises);
        } catch (e) {
            return msg.reply(`Could not award items: ${e}`);
        }

        delete require.cache[resolved];

        return msg.reply(`Successfully processed \`${staffList.length}\` staff member(s)!`);
    }
}

module.exports = GiveAllStaffItemCommand;