//const db = require('../database/mongo/');

const crypto      = require('../util/randomString');
const getAccount  = require('./find');

const Cache       = require('./cache');
const AuthCache   = new Cache();

const SpoobErrors = require('../error/SpoobErrors');

function begin(name, callback){
    getAccount.fromName(name, (success, result) => {
        if(!success) return callback(false, result);

        if(result.slack) return callback(false, SpoobErrors.ACCOUNT_ALREADY_AUTHED);
        if(result.auth)  return callback(true, result.auth);

        const authToken = crypto.generateId();

        result.auth = authToken;
        result.save(err => {
            if(err) return callback(false, SpoobErrors.ACCOUNT_SAVE_ERROR);
            callback(true, authToken);
        });
    }, true);
}

function isMinecraftAuthed(name, callback){
    if(AuthCache.minecraft.isItemCached(name)) return callback(true);
    
    getAccount.fromName(name, (success, result) => {
        if(!success)       return callback(false, result);
        if(!result.slack)  return callback(false, SpoobErrors.ACCOUNT_NOT_AUTHED);
        
        AuthCache.minecraft.addItemToCached(name, result.slack);
        callback(true);
    }, false);
}

function getAuthFromMinecraft(name, callback){
    if(AuthCache.minecraft.isItemCached(name)) return callback(true, AuthCache.minecraft.getCachedItem(name));

    getAccount.fromName(name, (success, result) => {
        if(!success)       return callback(false, result);
        if(!result.slack)  return callback(true, undefined);

        AuthCache.minecraft.addItemToCached(name, result.slack);
        callback(true, result.slack);
    }, false);
}

function getAuthFromSlack(slack, callback){
    if(AuthCache.slack.isItemCached(slack)) return callback(true, AuthCache.slack.getCachedItem(slack));

    getAccount.fromName(slack, (success, result) => {
        if(!success)       return callback(false, result);

        AuthCache.minecraft.addItemToCached(slack, result.username);
        callback(true, result.username);
    });
}

/**
 * @param {string} minecraft
 * @param {string} token
 * @param {string} slack
 * @param {function(object)} callback - function(err)
 */
function attemptAuthentication(minecraft, token, slack, callback){
    getAccount.fromName(minecraft, (success, account) => {
        if(!success) return callback(SpoobErrors.ACCOUNT_LOOKUP_ERROR);

        if(account.slack) return callback(SpoobErrors.ACCOUNT_ALREADY_AUTHED);
        if(!account.auth) return callback(SpoobErrors.ACCOUNT_AUTH_NOT_STARTED);

        if(account.auth != token) return callback(SpoobErrors.ACCOUNT_TOKEN_INVALID);

        account.auth  = undefined;
        account.slack = slack;

        account.save(err => {
            if(err) return callback(SpoobErrors.ACCOUNT_SAVE_ERROR);
            return callback(undefined);
        });
    });
}

exports.begin            = begin;

exports.checkMinecraft   = isMinecraftAuthed;
exports.getFromMinecraft = getAuthFromMinecraft;

exports.getFromSlack     = getAuthFromSlack;

exports.verify           = attemptAuthentication;

exports.cache            = AuthCache;