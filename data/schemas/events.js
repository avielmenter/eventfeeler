var mongoose = require('mongoose');
var moment = require('moment');

const WEBSOC_LOCATIONS = {
    'BS3 1200': [-117.845724, 33.645374],
    'EH 1200': [-117.841018, 33.643755],
    'ELH 100': [-117.840655, 33.644498],
    'HSLH 100A': [-117.844664, 33.645573],
    'PCB 1100': [-117.842691, 33.644471],
    'PSLH 100': [-117.843946, 33.643401],
    'SSLH 100': [-117.839758, 33.647211]
};

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
                ticket_uri : String,                                // url to buy a ticket for this event time
                comments_fetched : Boolean                          // are this event time's comments in the DB?
            }]
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
                    ticket_uri: event_time.ticket_uri,
                    comments_fetched: false
                });
            }
        }

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
            end_time: end ? new Date(end) : undefined,
            comments_fetched: false
        }];

        return e;
    }

    parseWebSOCTime(timeStr) {
        var startTimeStr = timeStr.substring(0, timeStr.indexOf('-')).trim();
        var endTimeStr = timeStr.substring(timeStr.indexOf('-') + 1).trim();

        var startHour = startTimeStr.substring(0, 2);
        var endHour = endTimeStr.substring(0, 2);

        if (startHour < endHour && endHour != 12 || (startHour == 12 && endHour == 12))
            startTimeStr += endTimeStr.substring(endTimeStr.length - 1) + 'm'; // append am/pm to startTimeStr
        else
            startTimeStr += endTimeStr.substring(endTimeStr.length - 1) == 'p' ? 'am' : 'pm';

        endTimeStr += endTimeStr[endTimeStr.length - 1] == 'p' ? 'm' : 'am';

        return { start_time: startTimeStr, end_time: endTimeStr };
    }

    fromWebSOC(c) {
        var e = {};

        var name = c.name;
        if (!c.sec.match(/\s*a\s*/i))
            name += " (Lecture " + c.sec + ")";

        e.event_ids = [{
            orig_id: name,
            from: 'WebSOC ' + c.term.val
        }];

        e.name = name;

        var locCoords = WEBSOC_LOCATIONS[c.place];
        if (!locCoords)
            locCoords = [0, 0];

        e.place = {
            name: c.place,
            loc: {
                type: 'Point',
                coordinates: locCoords
            }
        };

        e.event_times = []; // add event times

        var classDays = [false, false, false, false, false, false, false]; // Su M Tu W Th F S

        var daysStr = c.time.substring(0, c.time.indexOf(' ')).trim();
        var classTimes = this.parseWebSOCTime(c.time.substring(c.time.indexOf(' ') + 1).trim());

        for (var i = 0; i < daysStr.length; i++) {
            switch (daysStr[i]) {
                case 'M': classDays[1] = true; break;
                case 'T': classDays[daysStr[i + 1] == 'u' ? 2 : 4] = true; break;
                case 'W': classDays[3] = true; break;
                case 'F': classDays[5] = true; break;
                default: break;
            }
        }

        for (var today = c.term.start.clone(); today <= c.term.end; today.add(1, 'days')) {
            if (!classDays[today.isoWeekday() % 7] || today.format('YYYY-MM-DD') in c.term.holidays)
                continue;

            var todayStr = today.format('YYYY-MM-DD');

            e.event_times[e.event_times.length] = {
                start_time: moment(todayStr + " " + classTimes.start_time, 'YYYY-MM-DD hh:mmA').toDate(),
                end_time: moment(todayStr + " " + classTimes.end_time, 'YYYY-MM-DD hh:mmA').toDate(),
                comments_fetched: false
            };
        }

        return e;
    }
}

module.exports = new Events();
