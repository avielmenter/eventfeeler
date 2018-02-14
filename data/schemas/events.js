var mongoose = require('mongoose');

class Events
{
    constructor()
    {
        this.schema = new mongoose.Schema({
            event_id : {                                            // EventFeeler ID for the event
                type : {
                    orig_id: [String],                              // ID in the original event datasource
                    from: String                                    // origin datasource for the event (e.g. Facebook)
                },
                unique : true
            },
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
            }]
        });

        this.schema.index({'place.loc': '2dsphere'});
    }

    fromFacebook(fbEvent)
    {
        var e = {};
        e.event_id = {
            orig_id: fbEvent.id,
            from: "Facebook"
        };

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

        return e;
    }
}

module.exports = new Events();
