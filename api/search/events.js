const escapeStringRegexp = require('escape-string-regexp');

class eventsAPI {
    constructor(setAPI, setQuery) {
        this.api = setAPI;
        this.query = setQuery;
    }

    async ensureDBRecency(since, until) {
        var etsModel = this.api.mongoose.model('events_timespans', this.api.schemas.EventsTimespans.schema);

        var encompassing = await etsModel.findOne({ // is this timespan already filled with events?
            start: {$lte: since},
            end: {$gte: until}
        });

        if (encompassing !== null)
            return;

        var earliestEnd = await etsModel.findOne({ // don't search the _whole_ timespan queried if not necessary
            end: {$gte: since, $lte: until},
            start: {$lte: since}
        }).sort({end: 1});

        var latestStart = await etsModel.findOne({
            start: {$gte: since, $lte: until},
            end: {$gte: until}
        }).sort({start: -1});

        // SAVE FACEBOOK EVENTS
        var fbEventsAPI = require('../../data/fbEvents')(this.api);
        fbEventsAPI.since = earliestEnd == null ? since : earliestEnd.end;
        fbEventsAPI.until = latestStart == null ? until : latestStart.start;

        var events = await fbEventsAPI.get();
        console.log("Saving " + events.length + " new facebook events to database.");
        var newFBEvents = await fbEventsAPI.save(events);
        console.log("Events saved.");
        for (let newFB of newFBEvents) {
            var same = await this.findSame(newFB);
            if (same && same.length > 1)
                await this.merge(same);
        }
        console.log("Events merged.");

        // SAVE UCI EVENTS
        var calAPI = require('../../data/calendarEvents.js')(this.api);
        calAPI.since = fbEventsAPI.since;
        calAPI.until = fbEventsAPI.until;

        var vevents = await calAPI.get();
        console.log("Saving " + vevents.length + " new UCI calendar events to database.");
        var newCalEvents = await calAPI.save(vevents);
        console.log("Events saved.");
        for (let newCal of newCalEvents) {
            var same = await this.findSame(newCal);
            if (same && same.length > 1)
                await this.merge(same);
        }
        console.log("Events merged.");

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

    async findSame(e) {
        var start_times = e.event_times.map(et => et.start_time).filter(st => st !== undefined && st !== null);

        if (start_times.length <= 0)
            return [];

        var same = await this.api.schemas.Events.model.find({  // if they events share a start time and an event place name, they're the same
            event_times: { $elemMatch: { start_time: {$in: start_times } } },
            'place.name': { $regex: '\\s*' + escapeStringRegexp(e.place.name.toLowerCase()) + '\\s*', $options: 'i' }
        });

        return same;
    }

    async merge(events) {
        if (!events || events.length <= 0)
            return null;
        if (events.length == 1)
            return events[0];

        var event_times = [];

        for (let e of events) {
            for (let et1 of e.event_times) {    // This is O(n^2) when it could be O(n log n), but n is tiny, so w/e
                var anyTimesMatch = false;

                for (var i = 0; i < event_times.length; i++) {
                    var et2 = event_times[i];

                    var st1 = et1.start_time, st2 = et2.start_time, nt1 = et1.end_time, nt2 = et2.end_time;

                    if (st1 == st2) {
                        event_times[i].end_time = Math.max(nt1 ? nt1 : -Infinity, nt2 ? nt2 : -Infinity);
                        anyTimesMatch = true;
                    }
                    else if (st1 >= st2 && st1 <= nt2 || st2 >= st1 && st2 <= nt1) {
                        event_times[i].start_time = Math.min(st1 ? st1 : Infinity, st2 ? st2 : Infinity);
                        event_times[i].end_time = Math.max(nt1 ? nt1 : -Infinity, nt2 ? nt2 : -Infinity);
                        anyTimesMatch = true;
                    }
                }

                if (!anyTimesMatch)
                    event_times.push(et1);
            }
        }

        var merged = {
            name: events.filter(e => e.name)[0].name,
            description: events.filter(e => e.description)[0].description,
            place: events.filter(e => e.place.loc[0] != 0 && e.place.loc[1] != 0)[0].place,
            event_times: event_times
        };

        merged.event_ids = [];
        for (let e of events) {
            merged.event_ids = merged.event_ids.concat(e.event_ids);
        }
        // create new merged event
        var mergedDB = await this.api.schemas.Events.model.create(merged);
        // update old event IDs
        await this.api.schemas.Comments.model.update(
            { event_id: { $in: events.map(e => e._id) } },
            { $set: { event_id: mergedDB._id } }
        );

        await this.api.schemas.Users.model.update(
            { attending: { $elemMatch: { $in: events.map(e => e._id) } } },
            { $set: { 'attending.$': mergedDB._id } }
        );
        //delete old events
        var deletePromises = [];
        for (let e of events) {
            deletePromises.push(e.remove());
        }

        await Promise.all(deletePromises);

        return mergedDB;
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
        var eventsModel = this.api.mongoose.model('events', this.api.schemas.Events.schema);

        var mQuery = eventsModel.find({
            event_times: { $elemMatch : {
                start_time: {$gte: since},
                end_time: {$lte: until}
            }}
        });

        if (this.query.nearLat && this.query.nearLong && this.query.distance) {
            mQuery.where('place.loc').near({
                center: [this.query.nearLong, this.query.nearLat],
                spherical: true,
                maxDistance: this.query.distance / 111120.0 // meters to degrees(???)
            });
        }

        var events = await mQuery;
        console.log("Returning " + events.length + " events.");
        return events;
    }
}

module.exports = (setAPI, setQ) => new eventsAPI(setAPI, setQ);
