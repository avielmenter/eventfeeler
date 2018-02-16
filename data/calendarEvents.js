var axios = require('axios');
var ical = require('ical.js');

class calendarEvents {
    constructor(setAPI) {
        this.api = setAPI;
    }

    async get() {
        var response = await axios.get("https://today.uci.edu/calendar.ics");
        var jcal = new ical.Component(ical.parse(response.data));
        var vevents = jcal.getAllSubcomponents('vevent');

        var start = this.since || new Date('2001-01-01');
        var end = this.until || new Date('2030-01-01');

        var filtered = vevents.filter(vevent => {
            let dtstamp = new Date(vevent.getFirstPropertyValue('dtstart'));
            return dtstamp && (dtstamp >= start && dtstamp <= end);
        });

        return filtered;
    }

    async save(vevents) {
        var inserts = [];
        var eventModel = this.api.mongoose.model('events', this.api.schemas.Events.schema);

        for (let v of vevents) {
            var schemaEvent = this.api.schemas.Events.fromCalendar(v);

            inserts[inserts.length] = new Promise((res, rej) => {
                eventModel.findOneAndUpdate(
                    { 'event_id': schemaEvent.event_id },
                    schemaEvent,
                    { 'upsert': true },
                    function (err, prev) {
                        if (err)
                            rej(err);
                        else
                            res();
                    }
                );
            });
        }

        await Promise.all(inserts);
    }
}

module.exports = api => new calendarEvents(api);
