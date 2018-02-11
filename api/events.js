module.exports = function(config)
{
    var mongoose = require('mongoose');
    mongoose.connect(config.mongo);

    var schemas = require('./schemas');

    api = {};
    api.getEvents = function(callback)
    {
        schemas.Events.find(function(err, events) {
            callback(events);
        });
    }

    return api;
}
