class TraineeCommand extends frozor.MinecraftCommand {
    constructor() {
        super({
            name: 'traineesonly',
            requiredRank: 'trainee'
        });
    }

    async run(msg) {
        if (msg.rank  === 'TRAINEE') {
            return msg.reply('Trainee? I give you a Train F.').then(() => msg.reply('(That\'s one worse than E)'));
        } 
        return msg.reply('Isn\'t it weird how mods can use a command called TRAINEESonly?');
        
    }
}

class ModCommand extends frozor.MinecraftCommand {
    constructor() {
        super({
            name: 'modsonly',
            requiredRank: 'mod'
        });
    }

    async run(msg) {
        return msg.reply('I got 4 hours of sleep and can\'t think of anything good to put here.')
            .then(() => msg.reply('You\'re a mod. Whoop-de-doo.'));
    }
}

class SrModCommand extends frozor.MinecraftCommand {
    constructor() {
        super({
            name: 'srmodsonly',
            requiredRank: 'srmod'
        });
    }

    async run(msg) {
        return msg.reply('Why even bother being a Sr.Mod if you\'re not on QA?').then(() => msg.reply('Does mod coord make cool bots? Didn\'t think so.'));
    }
}

class LeaderCommand extends frozor.MinecraftCommand {
    constructor() {
        super({
            name: 'leadersonly',
            requiredRank: 'leader'
        });
    }

    async run(msg) {
        return msg.reply('What\'s a leader?').then(() => msg.reply('You really should have seen that coming.'));
    }
}

module.exports = [
    TraineeCommand,
    ModCommand,
    SrModCommand,
    LeaderCommand
];