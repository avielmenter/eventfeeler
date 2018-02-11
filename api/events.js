module.exports = function(api)
{
    var get = function(callback)
    {
        api.schemas.Events.find(function(err, events) {
            callback(events);
        });
    }

    return get;
}
