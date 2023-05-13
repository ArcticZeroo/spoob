const zeroDefaultInt = { type: Number, default: 0 };

module.exports = {
    Hacker: {
        username : String,
        stats    : {
            A:{
                max  : zeroDefaultInt,
                total: zeroDefaultInt
            },
            B:{
                max  : zeroDefaultInt,
                total: zeroDefaultInt
            },
            C:{
                max  : zeroDefaultInt,
                total: zeroDefaultInt
            },
            D:{
                max  : zeroDefaultInt,
                total: zeroDefaultInt
            },
            E:{
                max  : zeroDefaultInt,
                total: zeroDefaultInt
            },
            F:{
                max  : zeroDefaultInt,
                total: zeroDefaultInt
            },
            REGEN:{
                max  : zeroDefaultInt,
                total: zeroDefaultInt
            },
            GLIDE:{
                max  : zeroDefaultInt,
                total: zeroDefaultInt
            },
            SPEED:{
                max  : zeroDefaultInt,
                total: zeroDefaultInt
            },
            HEADROLL:{
                max  : zeroDefaultInt,
                total: zeroDefaultInt
            }
        }
    },
    DetectedName:{
        name     : String,
        word     : String,
        at       : Date
    },

    Account: {
        uuid                : { type: String },
        username            : String,
        namelower           : String,
        spoobux             : zeroDefaultInt,
        lastbonus           : zeroDefaultInt,
        slack               : { type: [String], default: [] },
        inventory           : { type: Object, default: {} },
        show_on_leaderboard : { type: Boolean, default: true },
        slack_commands      : { type: [String], default: [] },
        mineplex            : {
            accountId: Number
        }
    },

    AuthToken:{
        type: String,
        account: String,
        token: String
    },

    MineplexGwenBan: {
        region     : String,
        server     : String,
        username   : String,
        uuid       : String,
        hack       : String,
        metadata   : String,
        banwave    : { type: Boolean, default: false },
        time_to_ban: Number
    },

    PunishAdmin: {
        uuid        : String,
        name        : String,
        punishments : zeroDefaultInt,
        removals    : zeroDefaultInt
    },
    
    GwenBanServerGroup:{
        tag     : String,
        bans    : zeroDefaultInt,
        lastBan : zeroDefaultInt
    },

    TrackedPlayerList: {
        // List name
        name   : String,
        // UUID of the owner. This has no dashes.
        owner  : String,
        // Array of UUIDs. This has no dashes.
        admins : { type: [String], default: [] },
        // Array of UUIDs. This has no dashes.
        users  : { type: [String], default: [] },
        // this will toggle to false if it ever fails
        enabled: { type: Boolean, default: true },
        // The name of the channel as a string
        channel: String,
        // The org as an array of strings, of the bot's prefix
        //teams: {type: Array, default: []},
        team: String
    },
};