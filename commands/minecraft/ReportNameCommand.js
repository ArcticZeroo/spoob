const { StringUtil } = require('iron-golem');
const inames = require('../../lib/services/inappropriate-names');

class ReportNameCommand extends frozor.MinecraftCommand {
    constructor() {
        super({
            name: 'reportname',
            args: ['name']
        });
    }

    async run(msg) {
        const name = msg.args[0];

        if (!StringUtil.isValidMinecraftName(name)) {
            return msg.reply('That doesn\'t seem to be a valid Minecraft name, try again?');
        }

        try {
            await inames.sendMessage(name, `(Reported in MC by *${msg.user.name}*)`);
        } catch (e) {
            if ((e.message || e || '').includes('already been')) {
                return msg.reply('That name has already been reported, but thanks anyways!');
            }

            return msg.reply('Unable to report name to RC, please try again later.');
        }

        return msg.reply('Successfully reported name to RC.');
    }
}

module.exports = ReportNameCommand;