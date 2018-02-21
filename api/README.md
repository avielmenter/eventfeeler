# EventFeeler API

EventFeeler objects can be requested by making an HTTP GET request to a page in the `api` directory, or created and altered by making an HTTP POST request to the corresponding page. Objects manipulated using these APIs must be identified using their unique database ID. This can be found in the `_id` field of the object.

The following sections describe how each EventFeeler API can be accessed.

## GET /event/{event ID}

This API returns an `event` object matching the specified ID.

### Returns
This API returns an `event` object in the following format:

```javascript
[{
    _id : String,                                           // Event's ID in the database
    event_id : {                                            // original data source's ID for the event
        type : {
            orig_id: String,                                // ID in the original event datasource
            from: String                                    // origin datasource for the event (e.g. Facebook)
        },
        unique : true
    },
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
        ticket_uri : String                                 // url to buy a ticket for this event time
    }],
    comments_fetched : Boolean                              // are this event's comments in the DB?
}
```

## GET /comment/{comment ID}

This API returns a `comment` object matching the specified ID.

### Returns
This API returns a `comment` object in the following format:

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
    text : String,
    entities : [{                                       // entities like images or hashtags in the comment
        str : String,                                   // string representation of the entity (e.g. image url)
        entity_type : String                            // type of the entity (e.g. image, hashtag, etc.)
    }],
    loc : {                                             // GeoJSON object describing the comment's location
        type : {type: String, default: 'Point'},
        coordinates: {type: [Number], default: [0, 0]}, // location coordinates in order [long, lat]
    }
}
```

## GET /user/{user ID}

This API returns a `user` object matching the specified ID.

### Returns
This API returns a `user` object in the following format:

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
        image_url : String,     // URL of the user's profile image
    }
}
```
