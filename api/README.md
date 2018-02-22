# EventFeeler API

EventFeeler objects can be requested by making an HTTP GET request to a page in the `api` directory, or created and altered by making an HTTP POST request to the corresponding page.

Objects requested using the GET APIs must be identified using their unique database ID. This can be found in the `_id` field of the object.

The POST APIs can only be invoked when a user is logged in, in which case they will be invoked as that user. If no user is logged in, the API will return an HTTP 500 error.

The following sections describe how each EventFeeler API can be accessed.

## GET /event/:eventID

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

## GET /comment/:commentID

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
    comment_time : Date,                                // the time the comment was made
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

## POST /comment/:commentID?

This API creates or edits a comment in the database. If the ID is left blank, the API posts a new comment by the currently logged-in user. If the ID is specified, it edits the comment. The comment ID must refer to a comment the currently logged-in user has made.

### Parameters

This body of your POST request should contain a partially filled out `comment` object in the following format:

```javascript
{
    text : String,              // the text of the comment
    event_id : String           // the ID of the event being commented upon
}
```

### Returns

This API returns the created or updated `comment` object in the following format:

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
    }
}
```

## GET /user/:userID

This API returns a `user` object matching the specified ID. If the ID entered is `current`, then the API returns a `user` object for the user currently logged in.

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
