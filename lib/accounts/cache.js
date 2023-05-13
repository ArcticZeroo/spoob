const ItemTracker = require('../storage/ItemTracker');

class AuthenticationCache{
    constructor(){
        this.minecraft = new ItemTracker();
        this.slack     = new ItemTracker();
    }
}

module.exports = AuthenticationCache;