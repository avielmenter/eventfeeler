module.exports = function(mongoose)
{
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
