// This changes the prototype for Command.canRunSlack
const slackCommandHandler = require('../../lib/SlackCommandHandler');

frozor.SlackCommand = class SlackCommand extends frozor.Command {
    constructor(data) {
        super(data);
        this.canRun = frozor.Command.prototype.slackCanRun;
    }
};
frozor.SlackCommandParent = class SlackCommandParent extends frozor.CommandParent {
    constructor(data) {
        super(data);
        this.canRun = frozor.Command.prototype.slackCanRun;
    }
};

const legacyCommands = require('../legacy/slack');

for (const command of legacyCommands) {
    command.canRun = frozor.Command.prototype.slackCanRun;
}

const commands = [
    frozor.getCommand('WhoAmI'),
    frozor.getCommand('DeleteToken'),
    frozor.getCommand('PunishPlayers'),
    frozor.getCommand('BanMeta'),
    frozor.getCommand('SpoobSlots'),
    frozor.getCommand('ReapplyPunishment'),
    frozor.getCommand('McPing'),
    frozor.getCommand('Find'),
    frozor.getCommand('MinecraftChat'),
    frozor.getCommand('Restart'),
    frozor.getCommand('RestartRequest'),
    frozor.getCommand('FilterTest'),
    frozor.getCommand('Time'),
    frozor.getCommand('PunishmentHistory'),
    frozor.getCommand('Unpunish'),
    frozor.getCommand('UnpunishGwen'),
    frozor.getCommand('BanStatBoosting'),
    frozor.getCommand('Network911Report'),
    frozor.getCommand('ForceCreateAccount'),
    frozor.getCommand('GetRank'),
    frozor.getCommand('SetCoLead'),
    frozor.getCommand('GiveAllStaffItem'),
    frozor.getCommand('TrackerListCommands', false),
    frozor.getCommand('CommandPermissionCommands', false),
    ...frozor.getCommand('StagingServerCommands', false),
    ...frozor.getCommand('StalkCommands', false)
];

const slackCommands = [...commands, ...legacyCommands]
    .filter(c => !!c && c instanceof frozor.Command)
    .map(c => {
        if (Array.isArray(c.auth)) {
            c.auth = c.auth.map(u => u.toLowerCase());
        }

        return c;
    });

slackCommandHandler.register(...slackCommands);