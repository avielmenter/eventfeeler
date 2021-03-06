var mongoose = require('mongoose');
var axios = require('axios');
var querystring = require('querystring');

const SENTIMENT_URL = "http://text-processing.com/api/sentiment/";

class Comments {
    constructor() {
        this.schema = new mongoose.Schema({
            comment_id : {                                      // EventFeeler ID for the comment
                type : {
                    orig_id: String,                            // ID in the original comment datasource
                    from: String                                // name of the datasource this comment comes from
                },
                unique: true
            },
            event_id : {                                        // Object ID of the corresponding event
                type: String,
                required: true
            },
            user_id : {                                         // the ID of the user who made the comment
                type : String,
                required : true
            },
            comment_time : Date,                                // the time the comment was made
            text : String,
            entities : [{                                       // entities like images or hashtags in the comment
                str : String,                                   // string representation of the entity (e.g. image url)
                entity_type : String                            // type of the entity (e.g. image, hashtag, etc.)
            }],
            loc : {                                             // GeoJSON object describing the comment's location
                type : {type: String, default: 'Point'},
                coordinates: {type: [Number], default: [0, 0]}, // location coordinates in order [long, lat]
            },
            sentiment : Number,                                 // the positive sentiment for the comment
            neutral : Number,                                   // the probability the sentiment is neutral
        });

        this.schema.index({'loc': '2dsphere'});

        this.model = mongoose.model('comments', this.schema);
    }

    async calculateSentiment(comment) {
        var result = await axios.post(SENTIMENT_URL, querystring.stringify({ text: comment.text }));
        var sentiment = result.data.probability;

        comment.sentiment = sentiment.pos;
        comment.neutral = sentiment.neutral;

        await comment.save();
        return comment;
    }

    async averageSentimentForEvent(event_id) {
        var results = await this.model.find({ event_id: event_id }).select('sentiment neutral');
        var avg = 0, totalNonNeutrality = 0;

        for (let r of results) {
            avg += r.sentiment ? r.sentiment * (1.0 - r.neutral) : 0;
            totalNonNeutrality += r.neutral ? (1.0 - r.neutral) : 0;
        }

        avg /= totalNonNeutrality;
        return avg;
    }

    fromTwitter(tweet, event_id, user_id) {
        var c = {};
        c.event_id = event_id;
        c.comment_id = {
            orig_id: tweet.id_str,
            from: "Twitter"
        };

        c.user_id = user_id;
        c.comment_time = tweet.created_at;

        c.text = tweet.text;
        c.loc = tweet.coordinates;

        c.entities = [];

        for (let h of tweet.entities.hashtags) {
            c.entities.push({
                str: h.text,
                entity_type: "hashtag"
            });
        }

        for (let u of tweet.entities.urls) {
            c.entities.push({
                str: u.expanded_url,
                entity_type: "url"
            });
        }

        return c;
    }
}

module.exports = new Comments();
