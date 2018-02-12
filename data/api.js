var mongoose = require('mongoose');
var schemas = require('./schemas');

module.exports = function(config)
{
    var api = {};
    api.config = config;
    api.mongoose = mongoose;
    api.schemas = schemas;

    api.FB_ACCESS_TOKEN = config.FB_APP_ID + "|" + config.FB_APP_SECRET;
    api.FB_GRAPH = "https://graph.facebook.com/v2.12/search?";

    api.connect = function() {
        api.mongoose.connect(api.config.mongo);
    };

    return api;
};
