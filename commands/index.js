// Yep.
Object.assign(global.frozor, require('frozor-commands'));

frozor.loadCommand = function (toLoad) {
    if (typeof toLoad === 'function') {
        // Assume it's an instantiable class
        try {
            return new toLoad();
        } catch (e) {
            return null;
        }
    }

    if (typeof toLoad === 'object') {
        const commands = [];

        if (Array.isArray(toLoad)) {
            for (const cmd of toLoad) {
                commands.push(frozor.loadCommand(cmd));
            }
        } else {
            for (const key of Object.keys(toLoad)) {
                const cmd = toLoad[key];
                commands.push(frozor.loadCommand(cmd));
            }
        }

        return commands;
    }
};

frozor.getCommand = function (name, addCommand = true, dir = 'slack') {
    const required = (require(`./${dir}/${name}${addCommand ? 'Command' : ''}`));

    return frozor.loadCommand(required);
};

require('./slack');
require('./minecraft');