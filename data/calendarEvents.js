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

        var start = new Date(this.since) || new Date('2001-01-01');
        var end = new Date(this.until) || new Date('2030-01-01');

        console.log("Searching Calendar From: " + start);
        console.log("Searching Calendar To  : " + end);

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

            inserts[inserts.length] = this.api.schemas.Events.model.findOneAndUpdate(
                { 'event_ids': schemaEvent.event_ids[0] },
                schemaEvent,
                { 'upsert': true, new: true }
            );
        }

        return await Promise.all(inserts);
    }
}

module.exports = api => new calendarEvents(api);
