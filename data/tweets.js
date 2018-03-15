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

    async verifyUserInDB(user) {
        var dbUser = {
            twitter: {
                twitter_id: user.id_str,
                username: user.screen_name,
                display_name: user.name,
                profile_url: user.profile_image_url_https
            }
        };

        var twitterUser = await this.api.schemas.Users.model.findOneAndUpdate(
            {'twitter.twitter_id': user.id_str},
            dbUser,
            {upsert: true, new: true}
        );

        return twitterUser;
    }

    async save(comments, event_id) {
        var inserts = Array();

        for (let c of comments) {
            var efUser = await this.verifyUserInDB(c.user);
            var schemaComment = this.api.schemas.Comments.fromTwitter(c, event_id, efUser._id);

            inserts.push(this.api.schemas.Comments.model.findOneAndUpdate(
                { 'comment_id' : schemaComment.comment_id },
                schemaComment,
                { 'upsert': true, 'new': true }
            ));
        }

        var dbComments = await Promise.all(inserts);

        var sentiments = dbComments.map(async c => { 
                var comment = await this.api.schemas.Comments.calculateSentiment(c);
                var avg = await this.api.schemas.Comments.averageSentimentForEvent(c.event_id);

                await this.api.schemas.Events.model.findByIdAndUpdate(c.event_id, { $set: { sentiment: avg } });
                await this.api.schemas.Users.model.update(
                    { _id: c.user_id, attending: {$ne: c.event_id} },
                    { $addToSet: { attending: c.event_id } }
                );

                return comment;
        });

        var sentimentComments = await Promise.all(sentiments);
        return sentimentComments;
    }
}

module.exports = (setAPI) => new tweets(setAPI);
