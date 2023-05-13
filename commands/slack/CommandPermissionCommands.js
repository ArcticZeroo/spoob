const MongoUtil = require('../../lib/util/MongoUtil');
const commandHandler = require('../../lib/SlackCommandHandler');
const find = require('../../lib/accounts/find');

class CommandPermissionCommands extends frozor.SlackCommandParent {
    constructor() {
        super({
            name: 'permissions',
            aliases: ['commandpermissions'],
            children: [
                new CommandPermissionAdd(),
                new CommandPermissionRemove()
            ],
            superuser: true
        });
    }
}

class CommandPermissionAdd extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'add',
            aliases: ['grant', 'give', 'allow'],
            args: [{
                type: 'String',
                name: 'user',
                required: true
            }, {
                type: 'String',
                name: 'command',
                required: true
            }]
        });
    }

    async run(msg) {
        let { user, command } = this.parse(msg);

        if (!user.isSlackUser()) {
            return msg.reply('Hmm, that doesn\'t look like a slack user mention to me...');
        }

        command = command.toLowerCase();

        let account;
        try {
            account = await find.fromSlack(user.toSlackId());
        } catch (e) {
            return msg.reply('Unable to load that user\'s account.');
        }

        if (account.slack_commands.includes(command)) {
            return msg.reply('This user already has permission to use that command.');
        }

        if (!commandHandler.commands.keyArray().includes(command)) {
            return msg.reply('That command doesn\'t seem to exist.');
        }

        account.slack_commands.push(command);

        try {
            await MongoUtil.markAndSave(account, 'slack_commands');
        } catch (e) {
            return msg.reply('Sorry, but I couldn\'t save that user\'s account. Try again later?');
        }

        return msg.reply(`Success! *${account.username}* now has permission to use the command \`${command}\``);
    }
}

class CommandPermissionRemove extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'remove',
            aliases: ['delete', 'disallow'],
            args: [{
                type: 'String',
                name: 'user',
                required: true
            }, {
                type: 'String',
                name: 'command',
                required: true
            }]
        });
    }

    async run(msg) {
        let { user, command } = this.parse(msg);

        if (!user.isSlackUser()) {
            return msg.reply('Hmm, that doesn\'t look like a slack user mention to me...');
        }

        command = command.toLowerCase();

        let account;
        try {
            account = await find.fromSlack(user.toSlackId());
        } catch (e) {
            return msg.reply('Unable to load that user\'s account.');
        }

        if (!account.slack_commands.includes(command)) {
            return msg.reply('This user doesn\'t have permission to use that command.');
        }

        account.slack_commands.splice(account.slack_commands.indexOf(command), 1);

        try {
            await MongoUtil.markAndSave(account, 'slack_commands');
        } catch (e) {
            return msg.reply('Sorry, but I couldn\'t save that user\'s account. Try again later?');
        }

        return msg.reply(`Success! *${account.username}* no longer has permission to use the command \`${command}\``);
    }
}

module.exports = CommandPermissionCommands;