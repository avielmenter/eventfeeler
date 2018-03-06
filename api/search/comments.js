var moment = require('moment');

class commentsAPI {
    constructor(setAPI, setQuery) {
        this.api = setAPI;
        this.query = setQuery;
    }

    async ensureDBRecency(eventModel, ev) {
        var commentsModel = this.api.mongoose.model('Comment', this.api.schemas.Comments.schema);

        var dbComment = await commentsModel.findOne({ event_id: ev._id }).sort({'created_at': -1});

        this.api.ensureTwitterAuth();

        var tweets = require('../../data/tweets')(this.api);

        var twitterComments = [];

        if (!ev.place.loc || !ev.place.loc.coordinates || Math.abs(ev.place.loc.coordinates[0]) < 1)
            return []; // can't find tweets for unlocatable event

        tweets.long = ev.place.loc.coordinates[0];
        tweets.lat = ev.place.loc.coordinates[1];
        tweets.distance = 30;

        for (let time of ev.event_times) { // adds time to catch pre and post event tweets
            var minutes = ev.event_ids.filter(eid => eid.from.substring(0, 6) == 'WebSOC').length > 0 ? 5 : 30; // 5 min. for classes, 30 for other events

            tweets.since = dbComment ? moment(dbComment.created_at) : moment(time.start_time).add(-minutes, 'minute');
            tweets.until = time.end_time;

            if (!tweets.until || tweets.since <= moment(new Date()).add(-7, 'days')) // we can only grab week old tweets for free :(
                continue;

            if (time.comments_fetched)
                continue;
            else if (moment(new Date()) >= tweets.until)
                eventModel.findByIdAndUpdate(ev._id, { comments_fetched: true }).then();

            if (moment(new Date()) >= tweets.since)
                twitterComments = twitterComments.concat(await tweets.get());
        }

        await tweets.save(twitterComments, ev._id);
        console.log("Tweets saved.");
    }

    async get() {
        this.api.connect();

        if (!this.query.event_id)
            throw new Error("An event ID and origin datasource must be specified.");

        var eventModel = this.api.mongoose.model('Event', this.api.schemas.Events.schema);
        var ev = await eventModel.findById(this.query.event_id);

        if (!ev)
            throw new Error("Invalid ID specified.");

        await this.ensureDBRecency(eventModel, ev);

        var commentsModel = this.api.mongoose.model('Comment', this.api.schemas.Comments.schema);
        var comments = await commentsModel.find({ event_id: ev._id });

        return comments;
    }
}

module.exports = (setAPI, setQ) => new commentsAPI(setAPI, setQ);
