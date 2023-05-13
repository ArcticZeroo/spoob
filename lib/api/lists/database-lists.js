const EventEmitter = require('events');

const Collection = require('djs-collection');

const db = require('../../database/mongo');
const MineplexSocket = require('../../api/MineplexSocket');

const LoadPreference = {
    WAIT_FOR_SOCKET: 'wait_socket',
    WAIT_FOR_DATABASE: 'wait_database',
    WAIT_FOR_SOCKET_AND_DATABASE: 'wait_socket_database'
};

class DatabaseListController {
    constructor(model, loadPreference) {
        this.model = model;
        this.lists = new Collection();

        if (loadPreference) {
            this.handleLoading(loadPreference);
        }
    }

    _startOnDbReady() {
        if (db.isReady()) {
            this.start();
        } else {
            db.once('ready', this.start);
        }
    }

    handleLoading(preference) {
        if (preference === LoadPreference.WAIT_FOR_SOCKET) {
            MineplexSocket.onReady(() => this.start());
            return;
        }

        if (preference === LoadPreference.WAIT_FOR_DATABASE) {
            this._startOnDbReady();
            return;
        }

        if (preference === LoadPreference.WAIT_FOR_SOCKET_AND_DATABASE) {
            MineplexSocket.onReady(() => this._startOnDbReady());
            return;
        }
    }

    start() {}

    async getFromDb() {
        let docs;
        try {
            docs = await db[this.model].find({}).exec();
        } catch (e) {
            throw frozor.SpoobErrors.DATABASE_ERROR;
        }

        if (!docs) {
            throw frozor.SpoobErrors.DATABASE_NULL_RESULT;
        }

        return docs;
    }

    async loadFromDb() {
        let dbLists;
        try {
            dbLists = await this.getFromDb();
        } catch (e) {
            throw e;
        }

        for (const list of dbLists) {
            const instance = this.createList(list);

            this._add(instance);
        }
    }

    /**
     * Create a new DatabaseList from a document
     * based in mongo. It doesn't need to be saved
     * yet.
     * @param mongoDocument
     * @return {DatabaseList}
     */
    createList(mongoDocument) { return new DatabaseList(mongoDocument, this); }

    _add(listInstance) {
        if (!this.lists.has(listInstance.name)) {
            this.lists.set(listInstance.name, listInstance);
        }

        this.load(listInstance);
    }

    /**
     * Load a single database list instance after it has been retrieved from the db.
     * By default, this calls DatabaseList.activate on each user.
     * @param {DatabaseList} databaseList - The list instance to load.
     */
    load(databaseList) {
        for (const user of databaseList.users) {
            this.activate(user);
        }
    }

    async create(data) {
        const trackerList = this.createList(new db[this.model](data));

        try {
            await trackerList.saveToDb();
        } catch (e) {
            throw e;
        }

        this._add(trackerList);

        return trackerList;
    }

    /**
     * Remove a user from circulation. What this does depends on the list's implementation.
     * For instance, the tracker list will use this method to unstalk players on removal.
     * @param user
     */
    deactivate(user) {}

    /**
     * Add a user to circulation. What this does depends on the list's implementation.
     * For instance, the tracker list will use this method to stalk players on add.
     * @param user
     */
    activate(user) {}

    get listIterator () {
        return this.lists.values();
    }
}

class DatabaseList extends EventEmitter {
    constructor(dbList, controller) {
        super();

        this._list = dbList;
        this.controller = controller;
    }

    get list() {
        return this._list;
    }

    get name() {
        return this._list.name;
    }

    get users() {
        return this._list.users;
    }

    get enabled() {
        return this._list.enabled;
    }

    get admins() {
        return this._list.admins;
    }

    get owner() {
        return this._list.owner;
    }

    get team() {
        return this._list.team;
    }

    get channel() {
        return this._list.channel;
    }

    saveToDb() {
        return new Promise((resolve, reject) => {
            this._list.save(err => {
                if (err) {
                    reject(frozor.SpoobErrors.DATABASE_ERROR);
                } else {
                    resolve(this._list);
                }
            });
        });
    }

    save() {
        return this.saveToDb();
    }

    getUniqueUsers(users = this.users) {
        // Store a copy of the original users list
        const uniqueUsers = users.slice(0);

        // Iterate through each existing list...
        for (const controllerList of this.controller.lists.values()) {
            if (controllerList.name === this.name) {
                continue;
            }

            // get the list's users
            const listUsers = controllerList.users;

            const nonUniques = [];

            // if a user on usersToRemove is also on
            // another list, so that they aren't removed
            // erroneously
            for (let i = 0; i < uniqueUsers.length; i++) {
                const user = uniqueUsers[i];

                if (listUsers.includes(user)) {
                    nonUniques.push(i);
                }
            }

            // To prevent errors with concurrent modification
            for (const i of nonUniques) {
                uniqueUsers.splice(i, 1);
            }
        }

        // The only ones left are the ones not in any other list
        return uniqueUsers;
    }

    async remove() {
        // Remove this list from the collection
        this.controller.lists.delete(this.name);

        // Get all users unique to this list
        const usersToRemove = this.getUniqueUsers();

        for (const user of usersToRemove) {
            this.controller.deactivate(user);
        }

        return new Promise((resolve, reject) => {
            this._list.remove(err => {
                if (err) {
                    reject(frozor.SpoobErrors.DATABASE_ERROR);
                } else {
                    resolve();
                }
            });
        });
    }

    async addUsers(...users) {
        for (const user of users) {
            if (this.users.includes(user)) {
                throw new Error(`List ${this.name} already includes user ${user}`);
            }

            this.users.push(user);
            this.controller.activate(user);
        }

        return this.saveToDb();
    }

    async addAdmins(...users) {
        for (const user of users) {
            if (this.admins.includes(user)) {
                throw new Error(`List ${this.name} already includes admin user ${user}`);
            }

            this.admins.push(user);
        }

        return this.saveToDb();
    }

    async removeUsers(...usersToRemove) {
        for (const user of usersToRemove) {
            if (!this.users.includes(user)) {
                throw new Error(`List ${this.name} does not include user ${user}`);
            }

            this.users.splice(this.users.indexOf(user), 1);
        }

        const uniqueUsers = this.getUniqueUsers(usersToRemove);

        for (const user of uniqueUsers) {
            this.controller.deactivate(user);
        }

        return this.saveToDb();
    }

    async removeAdmins(...users) {
        for (const user of users) {
            if (!this.admins.includes(user)) {
                throw new Error(`List ${this.name} does not include admin user ${user}`);
            }

            this.admins.splice(this.admins.indexOf(user), 1);
        }

        return this.saveToDb();
    }

    async rename(newName) {
        const oldName = this.name;
        this._list.name = newName;

        try {
            await this.saveToDb();
            this.controller.lists.set(newName, this);
            this.controller.lists.delete(oldName);
        } catch (e) {
            throw e;
        }
    }

    async setEnabled(enabled = true) {
        this._list.enabled = enabled;

        return this.saveToDb();
    }

    async setChannel(channel) {
        this._list.channel = channel;

        return this.saveToDb();
    }

    async setTeam(team) {
        this._list.team = team;

        return this.saveToDb();
    }

    async setOwner(owner) {
        this._list.owner = owner;

        return this.saveToDb();
    }

    isOwner(user) {
        if (typeof user === 'object') {
            user = user.uuid;
        }

        if (typeof user === 'string') {
            return this.owner === user;
        }

        throw new TypeError('Expected type \'string\' for value \'user\'');
    }

    isAdmin(user) {
        if (typeof user === 'object') {
            user = user.uuid;
        }

        if (typeof user === 'string') {
            return this.admins.includes(user);
        }

        throw new TypeError('Expected type \'string\' for value \'user\'');
    }

    canEdit(user) {
        return (this.isOwner(user) || this.isAdmin(user));
    }
}

module.exports = { DatabaseListController, DatabaseList, LoadPreference };