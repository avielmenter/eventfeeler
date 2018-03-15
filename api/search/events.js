const escapeStringRegexp = require('escape-string-regexp');
var moment = require('moment');

const CURRENT_QUARTER = '2018-03';
const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const TZ = 'America/Los_Angeles';

class eventsAPI {
    constructor(setAPI, setQuery) {
        this.api = setAPI;
        this.query = setQuery;
    }

    async ensureDBRecency(since, until) {
        var existingClasses = await this.api.schemas.Events.model.find({ 'event_ids.from': 'WebSOC ' + CURRENT_QUARTER });
        if (existingClasses !== undefined && existingClasses !== null && existingClasses.length > 0) {
            console.log("Classes for this quarter already in database.");
        } else {
            console.log("Fetching classes from WebSOC...");
            var webSocAPI = require('../../data/webSOC.js')(this.api);
            var classes = await webSocAPI.get();

            console.log("Found " + classes.length + " classes.")
            await webSocAPI.save(classes);
            console.log("Classes saved.");
        }

        var etsModel = this.api.schemas.EventsTimespans.model;

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

        try {
            for (let newFB of newFBEvents) {
                var same = await this.findSame(newFB);
                if (same && same.length > 1)
                    await this.merge(same);
            }
            console.log("Events merged.");
        } catch (err) {
            console.log("Error merging events.");
            throw err;
        }

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

        var ts = {                       // timespan for events we've just saved
            start: new Date(since),
            end: new Date(until)
        };

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

        var savedTS = await etsModel.create(ts);

        await etsModel.find({ // remove timespans encompassed in this one
            start:  {$gte: ts.start},
            end:    {$lte: ts.end},
            _id:    {$ne: savedTS._id}
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
        var categories = [];

        for (let e of events) {
            for (let c of e.categories)
                if (!(c in categories))
                    categories.push(c);

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
            name: events.filter(e => e && e.name)[0].name,
            description: events.filter(e => e.description)[0].description,
            place: events.filter(e => e.place.loc[0] != 0 && e.place.loc[1] != 0)[0].place,
            event_times: event_times,
            categories: categories
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
        if ((!this.query.since || !this.query.until) && !this.query.categories && !this.query.name)
            throw new Error("You must specify a start and end date, an event name, or an event category for your query.");

        this.api.connect();

        var since = moment(this.query.since, TZ).toDate();
        var until = moment(this.query.until, TZ).toDate();

        if (!this.query.name && !this.query.categories && until - since > WEEK_IN_MS)
            throw new Error("You cannot request more than a week's worth of events at a time.");
        else if (until - since <= WEEK_IN_MS)
            this.ensureDBRecency(since, until).then(); // update DB asynchronously so we don't wait on the API fetching

        var eventsModel = this.api.schemas.Events.model;

        var categories = [];
        if (this.query.categories)
            categories = this.query.categories.split(',').map(c => c.trim().toLowerCase());

        var mQuery = {};

        if (this.query.since && this.query.until && until - since <= WEEK_IN_MS)
            mQuery.event_times = { $elemMatch : {
                start_time: {$gte: since},
                end_time: {$lte: until}
            }};

        if (!this.query.classes)
            mQuery.$or = [{'event_ids.from': 'Facebook'}, {'event_ids.from': 'Calendar'}] // no classes
        if (this.query.name)
            mQuery.name = new RegExp('.*' + this.query.name + '.*', 'i')
        if (categories.length > 0)
            mQuery.categories = { $all: categories };

        var dbQuery = eventsModel.find(mQuery);

        if (this.query.nearLat && this.query.nearLong && this.query.distance) {
            dbQuery.where('place.loc').near({
                center: {
                    type: 'Point',
                    coordinates: [this.query.nearLong, this.query.nearLat]
                },
                spherical: true,
                maxDistance: this.query.distance / 111120.0 // meters to degrees
            });
        }

        var events = (await dbQuery).map(dbEvent => dbEvent.toObject());
        for (let e of events) {
            e.numComments = await this.api.schemas.Comments.model.find({ event_id: e._id }).count();
        }

        console.log("Returning " + events.length + " events.");
        return events;
    }
}

module.exports = (setAPI, setQ) => new eventsAPI(setAPI, setQ);
