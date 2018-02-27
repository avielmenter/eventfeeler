var mongoose = require('mongoose');

class Events {
    constructor() {
        this.schema = new mongoose.Schema({
            event_ids : [{                                          // Original datasource IDs for the event
                orig_id: String,                                    // ID in the original event datasource
                from: String                                        // origin datasource for the event (e.g. Facebook)
            }],
            name : String,                                          // name of the event
            description : String,                                   // description of the event
            categories : [String],                                  // list of event categories
            place : {                                               // where the event takes place
                name : String,                                      // name of the event's location
                loc : {                                             // GeoJSON object describing the event's location
                    type : {type: String, default: 'Point'},
                    coordinates: {type: [Number], default: [0, 0]}, // location coordinates in order [long, lat]
                }
            },
            event_times: [{                                         // list of times the event takes place
                start_time: Date,                                   // time the event starts
                end_time: Date,                                     // time the event ends
                ticket_uri : String                                 // url to buy a ticket for this event time
            }],
            comments_fetched : Boolean                              // are this event's comments in the DB?
        });

        this.schema.index({'place.loc': '2dsphere'});
        this.model = mongoose.model('events', this.schema);
    }

    fromFacebook(fbEvent) {
        var e = {};
        e.event_ids = [{
            orig_id: fbEvent.id,
            from: "Facebook"
        }];

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

        e.comments_fetched = false;

        return e;
    }

    fromCalendar(calEvent) {
        var e = {};

        e.event_ids = [{
            orig_id: calEvent.getFirstPropertyValue('uid'),
            from: 'Calendar'
        }];

        e.name = calEvent.getFirstPropertyValue('summary');
        e.description = calEvent.getFirstPropertyValue('description');

        var locCoords = calEvent.getFirstPropertyValue('geo');
        if (locCoords)
            locCoords = locCoords.reverse();
        else
            locCoords = [0, 0];

        e.place = {
            name: calEvent.getFirstPropertyValue('location'),
            loc: {
                type: 'Point',
                coordinates: locCoords
            }
        };

        var start = calEvent.getFirstPropertyValue('dtstart');
        var end = calEvent.getFirstPropertyValue('dtend');

        e.event_times = [{
            start_time: start ? new Date(start) : undefined,
            end_time: end ? new Date(end) : undefined
        }];

        e.comments_fetched = false;

        return e;
    }
}

module.exports = new Events();
