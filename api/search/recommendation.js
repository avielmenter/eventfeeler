var moment = require('moment');

async function keyPromise(k, p) {
    var r = await p;
    return { key: k, result: r };
}

function removeDups(c) {
    return c.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    })
}

class recommendationAPI {
    constructor(setAPI, setQuery) {
        this.api = setAPI;
        this.query = setQuery;
    }

    async get(user) {   // writes a naive bayes classifier to find categories of events this user most likely enjoys
        if (!user || !user._id)
            throw new Error("You must be logged in as a user to get recommendations.");

        this.api.connect();

        var daysOut = this.query.days_out ? this.query.days_out : 7;
        var limit = this.query.limit ? Math.abs(this.query.limit) : 10; // Math.abs to prevent unbounded list sizes

        var attended = await this.api.schemas.Events.model.find({
            _id: { $in: user.attending }
        });

        if (!attended || attended.length < 1)
            return [];

        var totalAttended = attended.length;

        var pAttendAndCat = {};     // probability that the user attended this event and the event is in the given category
        var pCat = {};              // probability an event is in this category
        var pAttendGivenCat = {};   // the value we want to calculate: probability of attendance given a category

        var catCountPromises = [];

        for (let a of attended) {
            for (let c of removeDups(a.categories)) {
                if (!(c in pAttendAndCat)) {
                    pAttendAndCat[c] = 1.0;
                    catCountPromises.push(keyPromise(c, this.api.schemas.Events.model.count({ categories: c })));
                } else {
                    pAttendAndCat[c] += 1.0;
                }
            }
        }

        if (!pAttendAndCat || Object.keys(pAttendAndCat).length < 1)
            return [];

        var totalEvents = await this.api.schemas.Events.model.count({
            $or: [{ 'event_ids.from': 'Calendar' }, { 'event_ids.from': 'Facebook' }]
        });

        for (let k of Object.keys(pAttendAndCat))
            pAttendAndCat[k] = pAttendAndCat[k] / totalEvents;

        var pAttend = totalAttended / totalEvents;

        var catCountResults = await Promise.all(catCountPromises);
        for (let r of catCountResults) {
            pCat[r.key] = r.result / totalEvents;
        }

        for (let k of Object.keys(pCat))
            pAttendGivenCat[k] = pAttendAndCat[k] / pCat[k]; // Bayes' rule: p(a|b) = p(a AND b) / p(b)

        var upcomingEvents = await this.api.schemas.Events.model.find({ // find non-class events in the next week with category the user's attended
            $or: [{ 'event_ids.from': 'Calendar' }, { 'event_ids.from': 'Facebook' }],
            event_times: { $elemMatch: { start_time: {
                $lte: moment(new Date()).add(daysOut, 'days').toDate(),
                $gte: moment(new Date()).toDate()
            } } },
            categories: { $elemMatch: { $in: Object.keys(pCat) } }
        });

        var recommended = [];

        for (var u of upcomingEvents) {
            var r = u.toObject();
            r._id = u._id;
            r.probability = 1.0;

            for (let c of r.categories) {
                if (c in pCat)
                    r.probability *= pAttendGivenCat[c];
            }

            recommended.push(r);
        }

        return recommended.sort((l, r) => r.probability - l.probability).slice(0, limit);
    }
}

module.exports = (setAPI, setQuery) => new recommendationAPI(setAPI, setQuery);
