class eventsAPI {
    constructor(setAPI, setQuery) {
        this.api = setAPI;
        this.query = setQuery;
    }

    async ensureDBRecency(since, until) {
        var etsModel = this.api.mongoose.model('events_timespans', this.api.schemas.EventsTimespans);

        var encompassing = await etsModel.findOne({ // is this timespan already filled with events?
            start: {$lte: since},
            end: {$gte: until}
        });

        if (encompassing !== null)
            return;

        var fbEventsAPI = require('../data/fbEvents')(this.api);
        fbEventsAPI.since = since;
        fbEventsAPI.until = until;

        var events = await fbEventsAPI.get();
        console.log("Saving " + events.length + " new events to database.");
        await fbEventsAPI.save(events);
        console.log("Events saved.");

        var ts = new etsModel({    // timespan for events we've just saved
            start: since,
            end: until
        });

        var startOverlap = await etsModel.findOne({
            start: {$lte: ts.start},
            end: {$gte: ts.start}
        });

        var endOverlap = await etsModel.findOne({
            start: {$lte: ts.end},
            end: {$gte: ts.end}
        });

        if (startOverlap !== null)
            ts.start = startOverlap.start;
        if (endOverlap !== null)
            ts.end = endOverlap.end;

        ts.save((err) => {
            if (err)
                throw err;
        });

        await etsModel.find({ // remove timespans encompassed in this one
            start: {$gte: ts.start},
            end: {$lte: ts.end}
        }).remove();
    }

    async get() {
        if (!this.query.since || !this.query.until)
            throw new Error("You must specify a start and end date for your query.");

        this.api.connect();

        var since = new Date(this.query.since);
        var until = new Date(this.query.until);

        if (until - since > 7 * 24 * 60 * 60 * 1000) // greater than 1 week
            throw new Error("You cannot request more than a week's worth of events at a time.");

        await this.ensureDBRecency(since, until);
        var eventsModel = this.api.mongoose.model('events', this.api.schemas.Events);

        var events = await eventsModel.find({
            event_times: { $elemMatch: {
                start_time: {$gte: since},
                end_time: {$lte: until}
            }}
        });

        return events;
    }
}

module.exports = (setAPI, setQ) => new eventsAPI(setAPI, setQ);
