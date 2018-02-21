var mongoose = require('mongoose');

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
            user : {                                            // the user who made the comment
                name : String,                                  // user name or screen name
                profile_url : String                            // URL for the user's profile, if available
            },
            text : String,
            entities : [{                                       // entities like images or hashtags in the comment
                str : String,                                   // string representation of the entity (e.g. image url)
                entity_type : String                            // type of the entity (e.g. image, hashtag, etc.)
            }],
            loc : {                                             // GeoJSON object describing the comment's location
                type : {type: String, default: 'Point'},
                coordinates: {type: [Number], default: [0, 0]}, // location coordinates in order [long, lat]
            }
        });

        this.schema.index({'loc': '2dsphere'});

        this.model = mongoose.model('comments', this.schema);
    }

    fromTwitter(tweet, event_id) {
        var c = {};
        c.event_id = event_id;
        c.comment_id = {
            orig_id: tweet.id_str,
            from: "Twitter"
        };
        c.user = {
            name: tweet.user.name,
            profile_url: "https://twitter.com/" + (tweet.user.screen_name || "")
        };
        c.text = tweet.text;
        c.loc = tweet.coordinates;

        c.entities = [];

        for (let h of tweet.entities.hashtags) {
            c.entities.push({
                str: h,
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
