module.exports = function(api)
{
    var mod = {};

    mod.get = new Promise((resolve, reject) => {
        api.connect();
        api.schemas.Events.find(function(err, events) {
            if (err != null)
                reject(err);
            else
                resolve(events);
        });
    });

    return mod;
}
