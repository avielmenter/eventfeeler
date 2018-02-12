var mongoose = require('mongoose');

var schemas = {};

schemas.Events = mongoose.model('events', {
    name : String,
    description : String,
    categories : [String],
    place : {
        name : String,
        location : {
            latitude : Number,
            longitude : Number
        }
    },
    event_id : {type : String, unique : true},
    event_times: [{
        start_time: Date,
        end_time: Date,
        ticket_uri : String
    }]
});

schemas.eventFromFacebook = (fbEvent) => {
    var e = {};

    e.name = fbEvent.name;
    e.description = fbEvent.description;
    e.place = {
        name: fbEvent.place.name,
        location: fbEvent.place.location === undefined ? undefined : {
            latitude: fbEvent.place.location.latitude,
            longitude: fbEvent.place.location.longitude
        }
    };
    e.event_id = fbEvent.id;

    e.event_times = [];

    if (e.event_times === undefined || e.event_times.length == 0)
    {
        e.event_times.push({
            start_time: fbEvent.start_time,
            end_time: fbEvent.end_time
        });
    }
    else
    {
        for (let event_time of e.event_times)
        {
            e.event_times.push({
                start_time: event_time.start_time,
                end_time: event_time.end_time,
                ticket_uri: event_time.ticket_uri
            });
        }
    }

    return e;
}

module.exports = schemas;
