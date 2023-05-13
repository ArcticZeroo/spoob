module.exports = {
    pending_save_time    : 60*5,
    time_between_messages: 120,
    users_per_message    : 15,
    channels: {
        sentry_us: 'gwen-sentry-us',
        sentry_eu: 'gwen-sentry-eu',
        rc_names: 'gwen-rc-names'
    },
    severities: {
        a:          { low: 10,   medium: 25,     high: 50 },
        b:          { low: 15,   medium: 20,     high: 30, extreme: 500 },
        // Always low except for when it's extreme
        c:          { extreme: 500 },
        d:          { low: 500,  medium: 1000,   high: 1500, extreme: 8000 },
        e:          { low: 300,  medium: 700,    high: 2000, extreme: 8000 },
        f:          { low: 150,  medium: 250,    high: 350 },
        badpackets: { low: 500,  medium: 1000,   high: 2000, extreme: 5000 },
        glide:      { low: 500,  medium: 800,    high: 1500 },
        speed:      { low: 500,  medium: 800,    high: 1500 },
        timer:      { low: 2000, medium: 3000,   high: 4000 },
        fastbow:    { low: 10,   medium: 20,     high: 30 },

        //Always High
        headroll:   { low: 0,   medium: 0,       high: 0 },
    },
    bans:{
        a     : 1000,
        d     : 2000,
        glide : 10000,
        speed : 10000
    },
    websocket_url: 'ws://0'
};