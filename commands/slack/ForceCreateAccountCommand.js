const nameConverter = require('../../lib/storage/username-converter');
const db = require('../../lib/database/mongo');
const MongoUtil = require('../../lib/util/MongoUtil');

class ForceCreateAccountCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'forcecreateaccount',
            superuser: true,
            args: [
                {
                    type: 'string',
                    name: 'username'
                }
            ]
        });
    }

    async run(msg) {
        const { username } = this.parse(msg);

        if (!username || !username.length || !username.isValidMinecraftName()) {
            return msg.reply('That doesn\'t look like a valid Minecraft username. Try again?');
        }

        let uuid;
        try {
            uuid = await nameConverter.getUUID(username);
        } catch (e) {
            return msg.reply('Sorry, but I couldn\'t convert that name to a UUID. Did you get it right?');
        }

        const account = new db.Account({
            uuid, username,
            namelower: username.toLowerCase(),
            slack: msg.user.id
        });

        try {
            await MongoUtil.save(account);
        } catch (e) {
            return msg.reply('Sorry, but I couldn\'t save that account. Try again later?');
        }

        return msg.reply(`Done! Your account has been saved with the username *${username}*.`);
    }
}

module.exports = ForceCreateAccountCommand;