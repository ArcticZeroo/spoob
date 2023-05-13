/**
 * Attempt to load an arbitrary number of modules.
 * @param {function|object|Array} modules - Module or modules to load. Modules must be functions.
 * @param {...*} params - Parameters to pass to each module, when loaded
 */
function load(modules, ...params) {
    if (typeof modules === 'function') {
        modules(...params);
        return;
    }

    if (typeof modules === 'object') {
        if (Array.isArray(modules)) {
            for (const module of modules) {
                load(module, ...params);
            }
        } else {
            for (const key of Object.keys(modules)) {
                const module = modules[key];
                load(module, ...params);
            }
        }
    }
}

load.load = load;
module.exports = load;