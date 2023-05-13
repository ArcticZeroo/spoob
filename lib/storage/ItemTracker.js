class ItemTracker{
    constructor(){
        this._cached = {};
    }

    isItemCached(item){
        return (this._cached[item]) ? true : false;
    }

    getCachedItem(item){
        return this._cached[item];
    }

    addItemToCached(item, value){
        this._cached[item] = value;
        return this;
    }

    removeItemFromCached(item){
        delete this._cached[item];
        return this;
    }

    getCachedItems(){
        return this._cached;
    }

    clearCachedItems(){
        this._cached = {};
        return this;
    }
}

module.exports = ItemTracker;