class SocketBan {
    constructor(data, isBanwave) {
        this.region = data.region;
        this.server = data.server;
        this.username = this.playerName = data['player-name'];
        this.uuid = data['player-uuid'];
        this.hack = data.hack;
        this.metadata = data.metadata;
        this.isBanwave = isBanwave;
        this.timeToBan = data['time-to-ban'];
    }
}

module.exports = SocketBan;