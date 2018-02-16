var axios = require('axios');
var moment = require('moment');

class tweets {
    constructor(setAPI) {
        this.api = setAPI;
        this.lat = 33.6459816;      // coordinates for the center of Aldritch park
        this.long = -117.8427147;
        this.distance = 1000;

        this.since = new Date('2000-01-01');
        this.until = new Date('2000-01-02');
    }

    getURL() {
        var url = this.api.TWITTER_API + "1.1/search/tweets.json?q=";   // twitter only filters by date, so time filtering is manual
        url += "&since=" + moment(this.since).format('YYYY-MM-DD');
        url += "&until=" + moment(this.until).add(1, 'day').format('YYYY-MM-DD');
        url += "&geocode=" + this.lat + "," + this.long + "," + (this.distance / 1000) + "km";

        return url;
    }

    async get() {
        var apiurl = this.getURL();
        console.log("Fetching tweets from " + apiurl);

        var request = axios({
            url: apiurl,
            method: 'get',
            headers: {
                "Authorization": "Bearer " + this.api.TWITTER_ACCESS_TOKEN
            }
        });

        var response = await request;

        var statuses = response.data.statuses.filter(s => {
            let created_at = moment(s.created_at);
            return created_at >= moment(this.since) && created_at <= moment(this.until);
        });

        return statuses;
    }

    async save(comments, event_id) {
        var inserts = Array();

        for (let c of comments) {
            var schemaComment = this.api.schemas.Comments.fromTwitter(c, event_id);

            inserts[inserts.length] = new Promise((res, rej) => {
                var eventModel = this.api.mongoose.model('comments', this.api.schemas.Comments.schema);

                eventModel.findOneAndUpdate(
                    { 'comment_id' : schemaComment.comment_id },
                    schemaComment,
                    { 'upsert': true },
                    function(err, prev) {
                        if (err)
                            rej(err);
                        else
                            res();
                    }
                );
            });
        }

        Promise.all(inserts)
        .then(() => {
            // do nothing
        })
        .catch((err) => {
            throw err;
        });
    }
}

module.exports = (setAPI) => new tweets(setAPI);
