const crypto    = require('crypto');
//var base64url = require('base64url');

/**
 * @param length
 * @returns {void|Buffer}
 */
function getRandomBytes(length) {
    return crypto.randomBytes(length);
}

/**
 * @returns {String}
 */
Buffer.prototype.toBase64 = function(){
    return this.toString('base64');
};

/**
 * @returns {string}
 */
String.prototype.makeUrlFriendly = function () {
    return this.replace(/\+/g, getRandomChar()).replace(/\//g, getRandomChar()).replace(/=/g, '');
};

/**
 * @returns {string}
 */
function getRandomChar(){
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return chars.charAt(Math.floor(Math.random()*chars.length));
}

exports.generateId = function(bytes = Math.round( Math.random() ) + 5){
    return getRandomBytes(bytes).toBase64();
};