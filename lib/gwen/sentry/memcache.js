const Collection = require('djs-collection');
const config = require('../../../config/gwen');

const REGIONS = ['us', 'eu'];
const cache = {};

for (const region of REGIONS) {
    cache[region] = new Collection();
}

function addPlayer(violation) {
    const region = violation.region.toLowerCase();

    if (!REGIONS.includes(region)) {
        return;
    }

    const regionCache = cache[region];

    if (regionCache.has(violation.player)) {
        const existingViolation = regionCache.get(violation.player);

        // Don't update this entry if the existing VL is higher.
        if (violation.vl > existingViolation.vl) {
            regionCache.set(violation.player, violation);
        }

        // But return regardless, so we don't re-set the timer
        return;
    }

    regionCache.set(violation.player, violation);

    setTimeout(() => delete regionCache[violation.player], config.time_between_messages * 1000);
}

function clear(...regions) {
    if (regions.length === 0) {
        regions = REGIONS;
    }

    for (const region of regions) {
        if (!cache.hasOwnProperty(region)) {
            continue;
        }

        cache[region].clear();
    }
}

module.exports = { addPlayer, clear, cache, regions: REGIONS };