const { Attachment, Field } = require('frozor-slack-attachments');

class FilterTestCommand extends frozor.SlackCommand {
    constructor() {
        super({
            name: 'filtertest',
            aliases: ['testfilter', 'ft', 'filtered', 'isfiltered'],
            args: [{
                name: 'Text',
                required: true
            }]
        });

        this.maxArgs = Number.POSITIVE_INFINITY;
    }

    async run(msg, client, extra) {
        try {
            const { response, isFiltered } = await extra.minecraftClients.US.mineplex.filter.test(msg.args.join(' '));

            const attachment = new Attachment()
                .setTitle('Filter Test')
                .setColor(isFiltered ? '#F44336' : '#4CAF50')
                .addField(new Field()
                    .setTitle('Input')
                    .setShort(true)
                    .setValue(msg.args.join(' ')))
                .addField(new Field()
                    .setTitle('Output')
                    .setShort(true)
                    .setValue(response))
                .addField(new Field()
                    .setTitle('Filtered?')
                    .setValue(isFiltered ? 'Yes' : 'No'));

            return client.chat(msg.channel, '', { attachments: [attachment] });

        } catch (e) {
            return msg.reply(`Could not run a filter test: ${e}`);
        }
    }
}

module.exports = FilterTestCommand;