var mongoose = require('mongoose');

var schemas = {};

schemas.EventsTimespans = new mongoose.Schema({
    start: Date,
    end: Date
});

schemas.Events = new mongoose.Schema({
    name : String,
    description : String,
    categories : [String],
    place : {
        name : String,
        loc : {
            type : {type: String, default: 'Point'},
            coordinates: {type: [Number], default: [0, 0]},
        }
    },
    event_id : {type : String, unique : true},
    event_times: [{
        start_time: Date,
        end_time: Date,
        ticket_uri : String
    }]
});

schemas.Events.index({'place.loc': '2dsphere'});

schemas.eventFromFacebook = (fbEvent) => {
    var e = {};

    e.name = fbEvent.name;
    e.description = fbEvent.description;
    e.place = {
        name: fbEvent.place.name,
        loc: fbEvent.place.location === undefined ? undefined : {
            type: 'Point',
            coordinates: [
                fbEvent.place.location.longitude,
                fbEvent.place.location.latitude
        ]}
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
