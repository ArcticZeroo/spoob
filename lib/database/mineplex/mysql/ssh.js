const { Client } = require('ssh2');
const Logger = require('frozor-logger');
const log = new Logger('SSH');

class SshStream {
    constructor(fullConfig) {
        this.config = fullConfig;
        this._client = null;
        this._stream = null;
    }

    dispose(clientToo) {
        if (this._stream) {
            this._stream.end();
            this._stream.removeAllListeners();
            this._stream = null;
        }

        if (clientToo && this._client) {
            this._client.end();
            this._client.removeAllListeners();
            this._client = null;
        }
    }

    _createStream() {
        if (!this._client) {
            this._client = new Client();

            this._client.on('error', () => this._restart('Client Error'));
        }

        return new Promise((resolve, reject) => {
            this._client.once('ready', () => {
                this._client.forwardOut(
                    '127.0.0.1',
                    this.config.ssh.forwardOutPort,
                    this.config.mysql.host,
                    this.config.mysql.port,
                    (err, stream) => {
                        if (err) {
                            return reject(err);
                        }

                        this.config.mysql.host = 'localhost';
                        this.config.mysql.port = this.config.ssh.forwardOutPort;

                        this._stream = stream;
                        resolve(stream);
                    }
                );
            }).connect(this.config.ssh);
        });
    }

    _restart(reason) {
        log.warn(`Restarting SSH connection${reason ? `, reason: '${reason}'` : ''}...`);

        this.dispose();
        this.getStream()
            .catch(console.error);
    }

    _registerEvents() {
        this._stream.on('close', () => this._restart('Stream Closed'));
        this._stream.on('exit', (code, signal) => this._restart(`Stream Exit [Code ${code}] [Signal ${signal}]`));
        this._stream.on('error', () => this._restart('Stream Error'));
        this._stream.on('end', () => this._restart('Stream Ended'));
    }

    async getStream() {
        if (!this._stream) {
            try {
                await this._createStream();
            } catch (e) {
                throw e;
            }

            this._registerEvents();
        }

        return this._stream;
    }
}

module.exports = SshStream;