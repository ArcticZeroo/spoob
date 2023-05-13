const apiKeys = require('../../config/apiKeys');

const SamczsunAPIWrapper = require('../../../samczsun-api-wrapper/index');

module.exports = new SamczsunAPIWrapper(apiKeys.samczsun);
