const { StringUtil } = require('iron-golem');

const TimeUtil = require('../../lib/util/TimeUtil');

const UserGroup = require('../../config/usergroups');
const { punishments: { Punishment, Category } } = require('../../lib/api/SamczsunAPI');

class BanStatBoostingCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'banstatboosting',
            auth: UserGroup.RC,
            args: [
                {
                    name: 'user',
                    type: 'string',
                    required: true
                },
                {
                    name: 'extra text',
                    type: 'string',
                    required: false
                }
            ]
        });

        this.maxArgs = Number.POSITIVE_INFINITY;
    }

    async run(msg) {
        const user = msg.args[0];

        if (!StringUtil.isValidMinecraftName(user)) {
            return msg.reply('Not a valid Minecraft name!');
        }

        const extra = msg.args.slice(1).join(' ');

        const punishment = new Punishment({
            target: user,
            category: Category.GAMEPLAY,
            severity: 1,
            duration: TimeUtil.toHours(30, TimeUtil.TIME.DAY),
            reason: `Stat Boosting${msg.args.length > 1 ? ` - ${extra}` : ''}`,
            preventChecks: true
        });

        try {
            await punishment.punish();
        } catch (e) {
            console.error('Could not ban for stat boosting:');
            console.error(e);
            return msg.reply(`Unable to punish *${user}*, please try again later.`);
        }

        return msg.reply(`Successfully punished user *${user}* for stat boosting.`);
    }
}

module.exports = BanStatBoostingCommand;