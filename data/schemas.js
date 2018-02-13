var mongoose = require('mongoose');

var schemas = {};

schemas.EventsTimespans = new mongoose.Schema({
    start: Date,
    end: Date
});

schemas.Events = new mongoose.Schema({
    name : String,                                          // name of the event
    description : String,                                   // description of the event
    categories : [String],                                  // list of event categories
    place : {                                               // where the event takes place
        name : String,                                      // name of the evnet's location
        loc : {                                             // GeoJSON object describing the event's geographic location
            type : {type: String, default: 'Point'},
            coordinates: {type: [Number], default: [0, 0]}, // location coordinates in order [long, lat]
        }
    },
    event_id : {type : String, unique : true},              // EventFeeler id for the event
    event_times: [{                                         // list of times the event takes place
        start_time: Date,                                   // time the event starts
        end_time: Date,                                     // time the event ends
        ticket_uri : String                                 // url to buy a ticket for this event time
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
