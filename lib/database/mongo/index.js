const Database = require('fast-mongoose');

const url = require('./url');
const schemas = require('./schemas');

const db = new Database(url, schemas);

db.connect();

db.schemas = schemas;

module.exports = db;