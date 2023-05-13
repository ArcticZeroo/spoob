const EventEmitter = require('events');

const mysql = require('mysql2/promise');
const Logger = require('frozor-logger');
const Promise = require('bluebird');

const SshStream = require('./ssh');
const config = require('../../../../config/database');

const log = new Logger('MYSQL');

class Database extends EventEmitter {
    constructor(dbConfig) {
        super();

        this.config = dbConfig;
        this._ssh = new SshStream(dbConfig);
        this._pool = null;
        this._keepAliveTimer = null;

        this.on('error', e => {
            if ((e.message || e.toString()).toLowerCase().includes('timed')) {
                this.dispose(true);
                this.initNoAsync();
            }
        });
    }

    get started () {
        return !!this._pool;
    }

    dispose(sshClientToo) {
        if (this._pool) {
            if (this._pool.end) {
                this._pool.end();
            }

            this._pool.removeAllListeners();
            this._pool = null;
        }

        if (this._ssh) {
            this._ssh.dispose(sshClientToo);
        }

        if (this._keepAliveTimer) {
            clearInterval(this._keepAliveTimer);
        }
    }

    async init() {
        log.debug('Initializing database connection...');
        this.dispose();

        log.debug('Creating pool...');
        try {
            this._pool = await this._createPool();
        } catch (e) {
            if (e.fatal) {
                log.debug('Connection hit a fatal error:');
                log.debug(e);
                this.emit('error', e);
                throw e;
            }

            this.emit('error', e);
            throw e;
        }

        log.debug('Created pool!');

        this._registerEvents();

        this._keepAliveTimer = setInterval(() => this.keepAlive(), 20*1000);

        log.debug('Initialized database');
    }

    initNoAsync() {
        this.init()
            .catch(e => {
                log.error('Unable to start database:');
                log.error(e);
                this.emit('error', e);
            });
    }

    _registerEvents() {
        this._pool.on('error', err => {
            log.error('MySQL connection encountered an error:');
            log.error(err);

            this.emit('error', err);

            if (err.fatal || err.toString().includes('denied')) {
                setTimeout(() => this.initNoAsync(), 2500);
            }
        });
    }

    async _createPool() {
        let stream;
        try {
            stream = await this._ssh.getStream();
        } catch (e) {
            throw e;
        }

        let pool;
        try {
            pool = await mysql.createPool(Object.assign({}, this.config.mysql, { stream }), Promise);
        } catch (e) {
            throw e;
        }

        this._pool = pool;
        return pool;
    }

    async getConnection() {
        if (!this._pool) {
            log.debug('Initializing database since no pool exists');
            try {
                await this.init();
            } catch (e) {
                this.emit('error', e);
                throw e;
            }
        }

        log.debug('Getting a db connection from pool...');
        let connection;
        try {
            connection = await this._pool.getConnection();
        } catch (e) {
            this.emit('error', e);
            throw e;
        }

        log.debug('Got the connection');
        return connection;
    }

    keepAlive() {
        log.debug('Attempting to run a keepalive on the pool/connection');

        this.getConnection()
            .then(connection => {
                log.debug('Got the connection, pinging and releasing it');
                connection.ping();
                connection.release();
            })
            .catch(e => {
                log.error(`Could not run keepAlive on a connection:\n${e}`);
                this.emit('error', e);
            });
    }
}

const mainDatabase = new Database(config);

module.exports = { mainDatabase };