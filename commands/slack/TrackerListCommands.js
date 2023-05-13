const MineplexAPI = require('../../lib/api/MineplexAPI');
const { controller: trackerController } = require('../../lib/services/tracker-lists');
const nameConverter = require('../../lib/storage/username-converter');

class TrackerChildView extends frozor.SlackCommand {
    constructor(){
        super({
            name: 'view',
            aliases: ['list', 'info'],
            args: [
                {
                    name: 'listName',
                    type: 'String',
                    required: false
                }
            ]
        });
    }

    async run(msg, bot, extra) {
        if (msg.args.length === 0) {
            const listNames = [];
            let owned = 0;

            trackerController.lists.forEach((trackerList, name) => {
                listNames.push(name);

                if (trackerList.owner === extra.account.uuid) {
                    owned++;
                }
            });

            return msg.reply(`There are currently *${trackerController.lists.size}* list(s) (*${owned}* owned by you): \`${listNames.join('`, `')}\``);
        } 
        const listName = msg.args[0].toLowerCase();

        if (!trackerController.lists.has(listName)) {
            return msg.reply('Hmm... that list doesn\'t seem to exist.');
        }

        const trackerList = trackerController.lists.get(listName);

        const lines = [`List View | *${listName}*`, ''];

        try {
            lines.push(`*Owner:* ${await nameConverter.getUsername(trackerList.owner)}`);
            lines.push(`*Admins:* ${(await Promise.all(trackerList.admins.map(nameConverter.getUsername))).join(', ')}`);
            lines.push(`*Team:* ${trackerList.team}`);
            lines.push(`*Channel:* ${trackerList.channel}`);
            lines.push(`*User Count:* ${trackerList.users.length}`);

            if (msg.text.split(/\s+/)[2].toLowerCase() === 'list') {
                const promises = [];

                for (const uuid of trackerList.users) {
                    promises.push(nameConverter.getUsername(uuid));
                }

                try {
                    const names = await Promise.all(promises);

                    lines.push(`*Users:* \`${names.join('\`, \`')}\``);
                } catch (e) {
                    lines.push('*Users:* Could not get all usernames. Please try again later.');
                }
            }
        } catch (e) {
            return msg.reply('Hmm... something went wrong when I tried to find some usernames. Try again later?');
        }

        return msg.reply(lines.join('\n'));
        
    }
}

class TrackerChildChannel extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'channel'
        });
    }

    async run(msg, args, extra) {
        if (msg.args.length === 0) {
            return msg.reply('You need to input a channel name, silly!');
        }

        const channel = msg.args[0].toLowerCase();

        try{
            await extra.trackerList.setChannel(channel);

            return msg.reply(`Alright, *${extra.trackerList.name}* is going to send notifications to the channel \`${channel}\``);
        } catch (e) {
            return msg.reply('Hmm... I wasn\'t able to save that list. Try again later?');
        }
    }
}

class TrackerChildOwner extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'owner'
        });
    }

    async run(msg, args, extra) {
        if (!msg.user.superuser && !extra.trackerList.isOwner(extra.account)) {
            return msg.reply('You need to be the list owner to change ownership of this list.');
        }

        if (msg.args.length === 0) {
            return msg.reply('You need to input the name of the new owner, silly!');
        }

        const newOwnerName = msg.args[0];

        if (!newOwnerName.isValidMinecraftName()) {
            return msg.reply('Hmm... that doesn\'t seem to be a valid Minecraft name. Try again?');
        }

        let uuid;
        try{
            uuid = await nameConverter.getUUID(newOwnerName);
        } catch (e) {
            return msg.reply('Hmm... I wasn\'t able to get the UUID of that user. Try again later?');
        }

        if (extra.trackerList.owner === uuid) {
            return msg.reply('That person is already the owner...');
        }

        try {
            await extra.trackerList.setOwner(uuid);

            return msg.reply(`Alright, *${extra.trackerList.name}* is now owned by *${newOwnerName}*. I hope you know what you're doing.`);
        } catch (e) {
            return msg.reply('Sorry, but I couldn\'t save that list. Try again later?');
        }
    }
}

class TrackerChildTeam extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'team'
        });
    }

    async run(msg, args, extra) {
        const validTeams = Object.keys(extra.slackBots);

        if (msg.args.length === 0) {
            return msg.reply(`You need to input a team name, silly! Try one of these: *${validTeams.join('*, *')}*`);
        }

        const team = msg.args[0].toUpperCase();

        if (!validTeams.includes(team)) {
            return msg.reply(`Hmm... that team doesn't seem to be valid/available. Try one of these: *${validTeams.join('*, *')}*`);
        }

        try{
            await extra.trackerList.setTeam(team);

            return msg.reply(`Alright, *${extra.trackerList.name}* is going to send notifications to the team \`${team}\``);
        } catch (e) {
            return msg.reply('Hmm... I wasn\'t able to save that list. Try again later?');
        }
    }
}

class TrackerChildUserAdd extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'add',
            aliases: ['new']
        });
    }

    async run(msg, bot, extra) {
        if (msg.args.length === 0) {
            return msg.reply('You need to specify some users to add, silly.');
        }

        const uuids = [];

        for (const username of msg.args) {
            if (!username.isValidMinecraftName()) {
                return msg.reply(`Hmm... *${username}* doesn't seem to be a valid Minecraft name. Try again?`);
            }

            let uuid;
            try {
                uuid = await nameConverter.getUUID(username);
            } catch (e) {
                console.error(`Unable to get UUID for ${username}:`);
                console.error(e);
                return msg.reply(`Sorry, but I couldn't get a UUID for *${username}*. If they haven't changed their name, try again later.`);
            }

            if (extra.trackerList.users.includes(uuid)) {
                return msg.reply(`Hey, *${username}* is already on that list! Try again...`);
            }

            uuids.push(uuid);
        }

        try {
            await extra.trackerList.addUsers(...uuids);

            return msg.reply(`Successfully added *${msg.args.length}* user(s) to the list *${extra.trackerList.name}*`);
        } catch (e) {
            console.error(e);

            return msg.reply('Sorry, but I wasn\'t able to save that list. Try again later?');
        }
    }
}

class TrackerChildUserRemove extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'remove',
            aliases: ['delete']
        });
    }

    async run(msg, bot, extra) {
        if (msg.args.length === 0) {
            return msg.reply('You need to specify some users to remove, silly.');
        }

        const uuids = [];

        for (const username of msg.args) {
            if (!username.isValidMinecraftName()) {
                return msg.reply(`Hmm... *${username}* doesn't seem to be a valid Minecraft name. Try again?`);
            }

            let uuid;
            try {
                uuid = await nameConverter.getUUID(username);
            } catch (e) {
                console.error(e);
                return msg.reply(`Sorry, but I couldn't get a UUID for *${username}*. Try again later?`);
            }

            if (!extra.trackerList.users.includes(uuid)) {
                return msg.reply(`Hey, *${username}* isn't on that list! Try again...`);
            }

            uuids.push(uuid);
        }

        try {
            await extra.trackerList.removeUsers(...uuids);

            return msg.reply(`Successfully removed *${msg.args.length}* user(s) from the list *${extra.trackerList.name}*`);
        } catch (e) {
            console.error(e);

            return msg.reply('Sorry, but I wasn\'t able to save that list. Try again later?');
        }
    }
}

class TrackerParentUser extends frozor.SlackCommandParent {
    constructor() {
        super({
            name: 'user',
            aliases: ['users'],
            children: [
                // Add users
                new TrackerChildUserAdd(),
                // Remove users
                new TrackerChildUserRemove()
            ]
        });
    }
}

class TrackerChildAdminAdd extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'add',
            aliases: ['new']
        });
    }

    async run(msg, bot, extra) {
        if (msg.args.length === 0) {
            return msg.reply('You need to specify some admins to add, silly.');
        }

        const uuids = [];

        for (const username of msg.args) {
            if (!username.isValidMinecraftName()) {
                return msg.reply(`Hmm... *${username}* doesn't seem to be a valid Minecraft name. Try again?`);
            }

            let uuid;
            try {
                uuid = await nameConverter.getUUID(username);
            } catch (e) {
                console.error(e);
                return msg.reply(`Sorry, but I couldn't get a UUID for *${username}*. Try again later?`);
            }

            if (extra.trackerList.admins.includes(uuid)) {
                return msg.reply(`Hey, *${username}* is already an admin! Try again...`);
            }

            uuids.push(uuid);
        }

        try {
            await extra.trackerList.addAdmins(...uuids);

            return msg.reply(`Successfully added *${msg.args.length}* user(s) as admins for the list *${extra.trackerList.name}*`);
        } catch (e) {
            console.error(e);

            return msg.reply('Sorry, but I wasn\'t able to save that list. Try again later?');
        }
    }
}

class TrackerChildAdminRemove extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'remove',
            aliases: ['delete']
        });
    }

    async run(msg, bot, extra) {
        if (msg.args.length === 0) {
            return msg.reply('You need to specify some admins to remove, silly.');
        }

        const uuids = [];

        for (const username of msg.args) {
            if (!username.isValidMinecraftName()) {
                return msg.reply(`Hmm... *${username}* doesn\'t seem to be a valid Minecraft name. Try again?`);
            }

            let uuid;
            try {
                uuid = await nameConverter.getUUID(username);
            } catch (e) {
                console.error(e);
                return msg.reply(`Sorry, but I couldn't get a UUID for *${username}*. Try again later?`);
            }

            if (!extra.trackerList.admins.includes(uuid)) {
                return msg.reply(`Hey, *${username}* isn't an admin! Try again...`);
            }

            uuids.push(uuid);
        }

        try {
            await extra.trackerList.removeAdmins(...uuids);

            return msg.reply(`Successfully removed *${msg.args.length}* user(s) as admins from the list *${extra.trackerList.name}*`);
        } catch (e) {
            console.error(e);

            return msg.reply('Sorry, but I wasn\'t able to save that list. Try again later?');
        }
    }
}

class TrackerParentAdmin extends frozor.SlackCommandParent {
    constructor() {
        super({
            name: 'admin',
            aliases: ['admins'],
            children: [
                new TrackerChildAdminAdd(),
                new TrackerChildAdminRemove()
            ]
        });
    }

    async run(msg, bot, extra) {
        if (msg.args.length === 0) {
            return msg.reply(this.subCommandNotProvided(msg, bot, extra));
        }

        if (!msg.user.superuser && !extra.trackerList.isOwner(extra.account)) {
            return msg.reply('Sorry, but you need to be the list owner to edit this list.');
        }

        const subCommand = msg.args[0];

        msg.args.splice(0, 1);

        return this.act(subCommand, msg, bot, extra);
    }
}

class TrackerChildRename extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'rename'
        });
    }

    async run(msg, bot, extra) {
        if (!msg.user.superuser && !extra.trackerList.isOwner(extra.account)) {
            return msg.reply('Sorry, but you need to be the list owner to rename it.');
        }

        if (msg.args.length === 0) {
            return msg.reply('You need to enter the new name, silly!');
        }

        const newName = msg.args[0];
        const oldName = extra.trackerList.name;

        try {
            await extra.trackerList.rename(newName);
            return msg.reply(`Successfully renamed *${oldName}* to *${newName}*!`);
        } catch (e) {
            return msg.reply('Hmm... I wasn\'t able to save that list. Try again later?');
        }
    }
}

class TrackerParentEdit extends frozor.SlackCommandParent {
    constructor() {
        super({
            name: 'edit',
            args: [
                {
                    name: 'listName',
                    type: 'String',
                    required: true
                },
                {
                    name: 'action',
                    type: 'String',
                    required: true
                }
            ],
            children: [
                // Add and remove users
                new TrackerParentUser(),
                // Add and remove admins
                new TrackerParentAdmin(),
                // Set team
                new TrackerChildTeam(),
                // Set channel
                new TrackerChildChannel(),
                // Rename list
                new TrackerChildRename(),
                // Change owner of list
                new TrackerChildOwner()
            ]
        });
    }

    async run(msg, bot, extra) {
        if (msg.args.length === 0) {
            return msg.reply(this.subCommandNotProvided(msg, bot, extra));
        } else if (msg.args.length === 1) {
            return msg.reply('Please provide an action to take upon the given list.');
        }

        const listName = msg.args[0].toLowerCase();

        if (!trackerController.lists.has(listName)) {
            return msg.reply('Hmm... that list doesn\'t seem to exist.');
        }

        const action = msg.args[1].toLowerCase();

        msg.args.splice(0, 2);

        const trackerList = trackerController.lists.get(listName);

        if (!msg.user.superuser && !trackerList.canEdit(extra.account)) {
            const base = 'Hey, you can\'t edit that list!';

            try {
                const owner = await nameConverter.getUsername(trackerList.owner);

                return msg.reply(`${base} Contact *${owner}* for admin access.`);
            } catch (e) {
                return msg.reply(base);
            }
        }

        extra.trackerList = trackerList;

        return this.act(action, msg, bot, extra);
    }
}

class TrackerChildListCreate extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'add',
            aliases: ['create', 'new']
        });
    }

    async run(msg, bot, extra) {
        if (!msg.user.superuser && !MineplexAPI.ranks.hasPermission('ADMIN', extra.account.rank)) {
            return msg.reply('You need to be Admin+ to create lists.');
        }

        if (msg.args.length === 0) {
            return msg.reply('You need to specify a list name!');
        }

        const listName = msg.args[0].toLowerCase();

        if (trackerController.lists.has(listName)) {
            return msg.reply('Hmm... that list already exists.');
        }

        try {
            await trackerController.create({
                owner: extra.account.uuid,
                name: listName
            });
        } catch (e) {
            console.error(e);

            return msg.reply('Sorry, but I couldn\'t save your list. Please try again later.');
        }

        return msg.reply(`Congratulations, you are now the proud owner of the list *${listName}*!`);
    }
}

class TrackerChildListRemove extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'delete',
            aliases: ['remove']
        });
    }

    async run(msg, bot, extra) {
        if (msg.args.length === 0) {
            return msg.reply('You need to specify a list name!');
        }

        const listName = msg.args[0].toLowerCase();

        if (!trackerController.lists.has(listName)) {
            return msg.reply('Hmm... that list doesn\'t seem to exist.');
        }

        const trackerList = trackerController.lists.get(listName);

        if (!msg.user.superuser && !trackerList.isOwner(extra.account)) {
            const base = 'Hey, you can\'t remove that list!';

            try {
                const owner = await nameConverter.getUsername(trackerList.owner);

                return msg.reply(`${base} Contact *${owner}* to remove this list.`);
            } catch (e) {
                return msg.reply(base);
            }
        }

        try {
            await trackerList.remove();
            return msg.reply(`Successfully removed list *${listName}*.`);
        } catch (e) {
            if (e === frozor.SpoobErrors.DATABASE_ERROR) {
                return msg.reply('Sorry, but I wasn\'t able to remove that list from the database. Try again later?');
            } 
            console.error(e);
            return msg.reply('Hmm... something went wrong when removing that list. Try again later?');
            
        }

    }
}

class TrackerParentMain extends frozor.SlackCommandParent {
    constructor() {
        super({
            name: 'tracker',
            requiredRank: 'SR.MOD',
            auth: true,
            children: [
                // Edit lists
                new TrackerParentEdit(),

                // View list count and specific lists
                new TrackerChildView(),

                // Create lists
                new TrackerChildListCreate(),
                new TrackerChildListRemove()
            ]
        });
    }
}

module.exports = TrackerParentMain;