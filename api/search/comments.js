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

        if (!ev.place.loc || !ev.place.loc.coordinates)
            return []; // can't find tweets for unlocatable event

        tweets.long = ev.place.loc.coordinates[0];
        tweets.lat = ev.place.loc.coordinates[1];
        tweets.distance = 30;

        var allTimesPassed = true;

        for (let time of ev.event_times) { // adds half an hour to catch pre and post event tweets
            tweets.since = dbComment ? moment(dbComment.created_at) : moment(time.start_time).add(-30, 'minute');
            tweets.until = time.end_time ? moment(time.end_time).add(30, 'minute') : moment(time.start_time).clone().add(3, 'hour');

            if (moment(new Date()) >= tweets.since)
                twitterComments = twitterComments.concat(await tweets.get());
            else
                allTimesPassed = false;
        }

        if (allTimesPassed)
            eventModel.findByIdAndUpdate(ev._id, { comments_fetched: true }).then(doc => { });

        await tweets.save(twitterComments, ev._id);
    }

    async get() {
        this.api.connect();

        if (!this.query.event_id)
            throw new Error("An event ID and origin datasource must be specified.");

        var eventModel = this.api.mongoose.model('Event', this.api.schemas.Events.schema);
        var ev = await eventModel.findById(this.query.event_id);

        if (!ev)
            throw new Error("Invalid ID specified.");

        if (!ev.comments_fetched)
            await this.ensureDBRecency(eventModel, ev);

        var commentsModel = this.api.mongoose.model('Comment', this.api.schemas.Comments.schema);
        var comments = await commentsModel.find({ event_id: ev._id });

        return comments;
    }
}

module.exports = (setAPI, setQ) => new commentsAPI(setAPI, setQ);
