const Logger           = require('frozor-logger');
const log              = new Logger('VL-WEBSOCKET');

const ViolationSocket  = require('../lib/api/GwenSocket');
const GwenViolations   = new ViolationSocket();

GwenViolations.connect();