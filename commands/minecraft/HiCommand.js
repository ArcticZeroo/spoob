const responses = [
    'please leave me alone',
    'why are you still talking to me?',
    'um, can you not?',
    'was I talking to you?',
    msg => `hah, ${msg.user.name}? More like lame-${msg.user.name}`,
    'leave me alone already...',
    'I am being harassed!',
    'I\'m calling the cops!',
    '2004 called, it wants its greeting back.',
    'if I wanted to talk to you, don\'t you think I would have said hi already?',
    'excuse me? who even are you',
    'uh, do I know you?',
    'have we met?',
    'hey, can someone get this kid to stop bothering me?',
    'would you be interested in buying three gumdrops?',
    'if I had a nickel for every time I wanted you to stop talking to me, I\'d have infinite nickels.'
];

class HiCommand extends frozor.MinecraftCommand {
    constructor() {
        super({
            name: 'hi',
            aliases: ['hello', 'sup', '\'sup', 'yo', 'howdy', 'hullo', 'hey', 'heyo', 'hayo', 'hai', 'aye']
        });

        this.maxArgs = Number.POSITIVE_INFINITY;
    }

    async run(msg) {
        let response = responses.random();

        // If it's a function, call it with the msg as the arg
        if (typeof response === 'function') {
            response = response(msg);
        }

        return msg.reply(response);
    }
}

module.exports = HiCommand;