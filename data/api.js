var mongoose = require('mongoose');
var schemas = require('./schemas');

module.exports = function(config)
{
    var api = {};
    api.config = config;
    api.mongoose = mongoose;
    api.schemas = schemas;

    api.connect = function() {
        api.mongoose.connect(api.config.mongo);
    };

    return api;
};
