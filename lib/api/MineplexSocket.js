const Logger          = require('frozor-logger');
const log             = new Logger('VL-WEBSOCKET');

const EventEmitter    = require('events');

const config          = require('../../config/gwen');
const apiKeys         = require('../../config/apiKeys');

const { client: WebSocketClient } = require('websocket');

const { Punishment }  = require('./SamczsunAPI').punishments;

/*let RequestID = {
    AUTHENTICATION_RESPONSE  : 'AUTHENTICATION_RESPONSE',
    PLAYER_JOIN_SUBSCRIBE    : 'PLAYER_JOIN_SUBSCRIBE',
    PLAYER_JOIN_UNSUBSCRIBE  : 'PLAYER_JOIN_UNSUBSCRIBE'
};

let ResponseID = {
    PLAYER_JOIN_SUBSCRIBED         : 'PLAYER_JOIN_SUBSCRIBED',
    PLAYER_JOIN_UNSUBSCRIBED       : 'PLAYER_JOIN_UNSUBSCRIBED',
    PLAYER_JOIN_ALREADY_SUBSCRIBED : 'PLAYER_JOIN_ALREADY_SUBSCRIBED',
    PLAYER_JOIN_NOT_SUBSCRIBED     : 'PLAYER_JOIN_NOT_SUBSCRIBED',
    INVALID_PARAMETER              : 'INVALID_PARAMETER'
};*/

const MessageID = {
    CONNECTED         : 'CONNECTED',
    SUBSCRIBE         : 'SUBSCRIBE',
    UNSUBSCRIBE       : 'UNSUBSCRIBE',
    ILLEGAL_TYPE      : 'ILLEGAL_TYPE',
    SUBSCRIBED        : 'SUBSCRIBED',

    /* Server Creation */
    CREATE_SERVER     : 'CREATE_SERVER',
    KILL_SERVER       : 'KILL_SERVER',
};

//`ALERT`, `SUBSCRIBED`, `UNSUBSCRIBED`, `NOT_SUBSCRIBED`, `ALREADY_SUBSCRIBED`

const MessageChannel = {
    VIOLATIONS         : 'violations',
    GWEN_BAN           : 'gwen-ban',
    GWEN_BANWAVE       : 'gwen-banwave',
    PUNISHMENT_ADD     : 'punishments-add',
    PUNISHMENT_REMOVE  : 'punishments-remove',
    PLAYER_JOIN        : 'player-join',
    STAGING_SERVER     : 'staging-server',
    TWO_FACTOR         : 'two-factor',
    UPDATERANK         : 'updaterank',
    FIND_COMMAND       : 'find-command',
    DISGUISE_COMMAND   : 'disguise-command'
};

const MessageType = {
    // Generic
    ALERT              : 'ALERT',
    SUBSCRIBED         : 'SUBSCRIBED',
    UNSUBSCRIBED       : 'UNSUBSCRIBED',
    NOT_SUBSCRIBED     : 'NOT_SUBSCRIBED',
    ALREADY_SUBSCRIBED : 'ALREADY_SUBSCRIBED',

    // Disguises
    DISGUISE_ALERT     : 'DISGUISE_ALERT',
    UNDISGUISE_ALERT   : 'UNDISGUISE_ALERT',

    // Server deployment
    UPDATE             : 'UPDATE'
};

//ABORTED, FAILURE, SUCCESS, CANCELLED, UNSTABLE, or UNKNOWN

function getApiKey(){
    return apiKeys.samczsun;
}

function getAdminTargetObject(message) {
    return {
        admin:{
            name: message.content['admin-name'],
            uuid: message.content['admin-uuid']
        },
        target:{
            name: message.content['target-name'],
            uuid: message.content['target-uuid']
        }
    };
}

class GwenSocket extends EventEmitter{
    constructor(){
        super();
        this.socket      = new WebSocketClient();
        this.isConnected = false;

        this.connection  = null;

        this.defaultSubscriptions = [
            MessageChannel.VIOLATIONS,
            MessageChannel.PUNISHMENT_ADD,
            MessageChannel.PUNISHMENT_REMOVE,
            MessageChannel.PLAYER_JOIN,
            MessageChannel.STAGING_SERVER,
            MessageChannel.GWEN_BAN,
            MessageChannel.GWEN_BANWAVE,
            MessageChannel.TWO_FACTOR,
            MessageChannel.UPDATERANK,
            MessageChannel.FIND_COMMAND,
            MessageChannel.DISGUISE_COMMAND
        ];

        this.subscribedChannels = [];

        this.socket.on('connect', connection => {
            connection.on('message', message => {
                if(message.type !== 'utf8') return;

                message = JSON.parse(message.utf8Data);

                if(message.id){
                    switch(message.id){
                        case MessageID.CONNECTED:
                            this.isConnected = true;
                            this.connection  = connection;

                            for(const channel of this.defaultSubscriptions){
                                this.subscribe(channel);
                            }

                            log.info(`Connected to ${log.chalk.cyan('GWEN Violations WebSocket')}!`);
                            this.emit('connected');
                            this.emit('ready');

                            break;
                        case MessageID.ILLEGAL_TYPE:
                            try{
                                const errMsg = `Illegal Type: ${message.content.reason}`;
                                log.error(errMsg);
                                this.emit('error', log.chalk.stripColor(errMsg));
                            }catch(e){
                                log.error('Illegal type threw an error, but I caught it! That\'s three outs!');
                            }
                            break;
                        case MessageID.SUBSCRIBED:
                            log.debug(`Successfully subscribed to the channel ${log.chalk.cyan(message.content.channel)}`);
                            this.emit('subscribed', message.content.channel);
                            this.subscribedChannels.push(message.content.channel);
                    }
                }else if(message.channel){
                    message.type    = message.content.id;
                    message.content = message.content.content;

                    switch(message.channel){
                        case MessageChannel.VIOLATIONS:
                            if(message.type === MessageType.ALERT){
                                this.emit(`violation-${message.content.region.toLowerCase()}`, message.content);
                                this.emit('violation', message.content.region.toLowerCase(), message.content);
                            }
                            break;
                        case MessageChannel.GWEN_BAN:
                            if(message.type === MessageType.ALERT){
                                this.emit('gwenBan', message.content, false);
                            }
                            break;
                        case MessageChannel.GWEN_BANWAVE:
                            if(message.type === MessageType.ALERT){
                                this.emit('gwenBan', message.content, true);
                            }
                            break;
                        case MessageChannel.PUNISHMENT_ADD:
                            if(message.type === MessageType.ALERT){
                                const punishment = new Punishment(message.content);
                                this.emit('punishmentAdd', punishment);
                            }
                            break;
                        case MessageChannel.PUNISHMENT_REMOVE:
                            if(message.type === MessageType.ALERT){
                                const punishment = new Punishment(message.content);
                                this.emit('punishmentRemove', punishment);
                            }
                            break;
                        case MessageChannel.PLAYER_JOIN:
                            switch (message.type) {
                                case MessageType.ALERT:
                                    this.emit('playerJoin', message.content.uuid, message.content.region);
                                    this.emit(`playerJoin-${message.content.uuid}`, message.content.region);
                                    break;
                            }
                            break;
                        case MessageChannel.STAGING_SERVER:
                            const nonce = message.content.nonce;

                            const emitStagingUpdate = (event, data = {}) => {
                                this.emit(`staging-${event}`, nonce, data);
                                this.emit(`staging-${event}-${nonce}`, data);
                            };

                            if(message.type === MessageType.UPDATE){
                                emitStagingUpdate('update', {
                                    message: message.content.message,
                                    done   : message.content.done || false
                                });
                            }

                            break;
                        case MessageChannel.TWO_FACTOR:
                            if(message.type === MessageType.ALERT){
                                this.emit('twoFactorReset', getAdminTargetObject(message));
                            }
                            break;
                        case MessageChannel.UPDATERANK:
                            if(message.type === MessageType.ALERT){
                                this.emit('updaterank', {
                                    admin:{
                                        name: message.content['caller-name'],
                                        uuid: message.content['caller-uuid']
                                    },
                                    target:{
                                        name: message.content['target-name'],
                                        newRank: message.content['new-rank']
                                    },
                                    server: message.content.server,
                                    region: message.content.region
                                });
                            }
                            break;
                        case MessageChannel.FIND_COMMAND:
                            if(message.type === MessageType.ALERT){
                                this.emit('findCommand', Object.assign({ server: message.content.server }, getAdminTargetObject(message)));
                            }
                            break;
                        case MessageChannel.DISGUISE_COMMAND:
                            function getEmitObject() {
                                return Object.assign({ server: message.content.server, region: message.content.region, skin: message.content['target-skin'] }, getAdminTargetObject(message));
                            }

                            if(message.type === MessageType.DISGUISE_ALERT){
                                this.emit('disguiseCommand', getEmitObject());
                            }else if(message.type === MessageType.UNDISGUISE_ALERT){
                                this.emit('undisguiseCommand', getEmitObject());
                            }

                            break;
                    }
                }
            });

            connection.on('error', error => {
                log.error(`Error in connection to WebSocket: ${log.chalk.red(error)}`);
                this.notConnected();
            });

            connection.on('close', (code, description) => {
                log.warning(`WebSocket connection closed [${log.chalk.cyan(code)}] - ${log.chalk.magenta(description)}`);
                this.notConnected();
            });

            connection.on('connectFailed', () => {
                log.warning('Unable to connect to the WebSocket server.');
                this.notConnected();
            });
        });
    }

    notConnected(){
        this.isConnected = false;
        setTimeout(() => {this.resetConnection(this.connection);}, 10000);
    }

    resetConnection(connection){
        log.warning(log.chalk.magenta('Resetting Websocket Connection...'));
        if(connection) connection.drop();
        this.connection = null;
        this.connect();
    }

    connect(){
        log.info(`Connecting to ${log.chalk.cyan('GWEN Violations WebSocket')}...`);
        this.isConnected = false;
        this.socket.connect(config.websocket_url);

        setTimeout(() => {
            if(!this.isConnected) this.resetConnection();
        }, 15*1000);
    }

    sendJSON(json){
        this.connection.sendUTF(JSON.stringify(json));
    }

    subscribe(channel){
        this.sendJSON({ id: MessageID.SUBSCRIBE, content:{ channel, key: getApiKey() } });
    }

    unsubscribe(channel){
        this.sendJSON({ id: MessageID.UNSUBSCRIBE, content:{ channel, key: getApiKey() } });
    }

    stalk(uuid){
        this.sendJSON({ channel: MessageChannel.PLAYER_JOIN, content:{ id: MessageID.SUBSCRIBE, content: { key: getApiKey(), uuid } } });
    }

    unstalk(uuid){
        this.sendJSON({ channel: MessageChannel.PLAYER_JOIN, content:{ id: MessageID.UNSUBSCRIBE, content: { key: getApiKey(), uuid } } });
    }

    createServer(args, nonce){
        this.sendJSON({ channel: MessageChannel.STAGING_SERVER, content:{ id: MessageID.CREATE_SERVER, content:{ args, nonce } } });
    }

    killServer(args, nonce){
        this.sendJSON({ channel: MessageChannel.STAGING_SERVER, content:{ id: MessageID.KILL_SERVER, content:{ args, nonce } } });
    }

    static getFakeChannelMessage (channel, type, content) {
        return {
            type: 'utf8',
            utf8Data: JSON.stringify({
                channel,
                content: {
                    type,
                    content
                }
            })
        };
    }

    sendFakeMessage (channel, type, data) {
        if (!this.connection) return;

        const msg = GwenSocket.getFakeChannelMessage(channel, type, data);

        this.connection.emit('message', msg);
    }

    onReady(method) {
        if (this.isConnected) {
            method();
            return;
        }

        this.once('ready', method);
    }
}

GwenSocket.prototype.MessageChannel = GwenSocket.MessageChannel = MessageChannel;
GwenSocket.prototype.MessageID = GwenSocket.MessageID = MessageID;
GwenSocket.prototype.MessageType = GwenSocket.MessageType = MessageType;

module.exports = new GwenSocket();