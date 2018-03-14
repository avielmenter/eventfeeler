# EventFeeler Data Types

EventFeeler uses a MongoDB back-end. The objects returned through the [APIs](https://github.com/avielmenter/eventfeeler/tree/master/api) usually have the same structure as they do in the database.

These objects are defined in the following way:

## Event

An Event object represents an event in the EventFeeler database. These events can originate from multiple data sources, including Facebook and the UCI Events Calendar.

### Definition
```javascript
{
    _id : String,                                           // Event's ID in the database
    event_ids : [{                                          // Original datasource IDs for the event
        orig_id: String,                                    // ID in the original event datasource
        from: String                                        // origin datasource for the event (e.g. Facebook)
    }],
    name : String,                                          // name of the event
    description : String,                                   // description of the event
    categories : [String],                                  // list of event categories
    place : {                                               // where the event takes place
        name : String,                                      // name of the event's location
        loc : {                                             // GeoJSON object describing the event's location
            type : {type: String, default: 'Point'},
            coordinates: {type: [Number], default: [0, 0]}, // location coordinates in order [long, lat]
        }
    },
    event_times: [{                                         // list of times the event takes place
        start_time: Date,                                   // time the event starts
        end_time: Date,                                     // time the event ends
        ticket_uri : String,                                // url to buy a ticket for this event time
        comments_fetched : Boolean                          // are this event time's comments in the DB?
    }],
    sentiment : Number,                                     // average sentiment for this event
    numComments : Number                                     // the number of comments made on this event
}
```

## User

A User object represents a social media user in the EventFeeler DataBase. EventFeeler has no native users. To log into EventFeeler, a user must authenticate via one of the social media websites compatible with the User object.

### Definition
```javascript
{
    _id : String,               // User's ID in the database
    primary_profile : String,   // social media profile determining user's appearance on EventFeeler
    twitter : {                 // information about this user's twitter profile
        twitter_id : {          // User's ID on Twitter
            type: String,
            trim: true,
            unique: true,
            sparse: true
        },
        username : String,      // User's username on Twitter
        display_name : String,  // User's display name on Twitter
        image_url : String      // URL of the user's profile image
    },
    facebook : {
        facebook_id : {
            type: String,
            trim: true,
            unique: true,
            sparse: true
        },
        display_name : String
    },
    attending : [String]        // list of IDs of events the user is attending
}
```

## Comment

A Comment object represents a comment in the EventFeeler database. Comments are either pulled from Twitter, or can be made on EventFeeler using the [Comment POST API](https://github.com/avielmenter/eventfeeler/tree/master/api#post-commentcommentid).

### Definition
```javascript
{
    _id : String,                                       // Comment's ID in the database
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
}
```
