var moment = require('moment');


class recommendationAPI {
    constructor(setAPI, setQuery) {
        this.api = setAPI;
        this.query = setQuery;
    }

    static async keyPromise(k, p) {
        var r = await p;
        return { key: k, result: r };
    }

    static removeDups(c) {
        return c.sort().filter(function(item, pos, ary) {
            return !pos || item != ary[pos - 1];
        })
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
            
        var allCategories = await this.api.schemas.Events.model.find({}).distinct('categories');

        var pAttendAndCat = {};     // probability that the user attended this event and the event is in the given category
        var pAttendNotCat = {};     // probability that the user attended an event not in this category
        var pCat = {};              // probability an event is in this category

        var catCountPromises = [];

        for (let a of attended) {
            var eventCategories = recommendationAPI.removeDups(a.categories);

            for (let c of allCategories) {
                if (eventCategories.includes(c))
                    pAttendAndCat[c] = (c in pAttendAndCat ? pAttendAndCat[c] + 1.0 : 1.0);
                else
                    pAttendNotCat[c] = (c in pAttendNotCat ? pAttendNotCat[c] + 1.0 : 1.0);

                if (catCountPromises.length < allCategories.length)
                    catCountPromises.push(recommendationAPI.keyPromise(c, this.api.schemas.Events.model.count({ categories: c })));
                /*
                if (!(c in pAttendAndCat)) {
                    pAttendAndCat[c] = 1.0;
                    catCountPromises.push(recommendationAPI.keyPromise(c, this.api.schemas.Events.model.count({ categories: c })));
                } else {
                    pAttendAndCat[c] += 1.0;
                }//*/
            }
        }

        if (!pAttendAndCat || Object.keys(pAttendAndCat).length < 1)
            return [];
            
        var catCountResults = await Promise.all(catCountPromises);
        for (let r of catCountResults)
            pCat[r.key] = r.result;

        var upcomingEvents = await this.api.schemas.Events.model.find({ // find non-class events in the next week with category the user's attended
            $or: [{ 'event_ids.from': 'Calendar' }, { 'event_ids.from': 'Facebook' }],
            event_times: { $elemMatch: { start_time: {
                $lte: moment(new Date()).add(daysOut, 'days').toDate(),
                $gte: moment(new Date()).toDate()
            } } },
            categories: { $elemMatch: { $in: Object.keys(pAttendAndCat) } },
            // categories: { $in: Object.keys(pCat)  },
            _id: { $nin: user.attending }
        });

        var recommended = [];

        for (var u of upcomingEvents) {
            var r = u.toObject();
            r._id = u._id;
            r.probability = 1.0;

            for (let c of allCategories)
                if (c in r.categories)
                    r.probability *= pAttendAndCat[c] / pCat[c]; // Bayes' rule: p(a|b) = p(a AND b) / p(b)
                else
                    r.probability *= pAttendNotCat[c] / pCat[c];

            recommended.push(r);
        }

        return recommended.sort((l, r) => r.probability - l.probability)
                            .filter(r => r.probability > 0)
                            .slice(0, limit);
    }
}

module.exports = (setAPI, setQuery) => new recommendationAPI(setAPI, setQuery);
