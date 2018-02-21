# EventFeeler API

EventFeeler objects can be searched by making an HTTP GET request to a page in the `api/search` directory. The following sections describe how each EventFeeler search API can be accessed.

## GET /search/events

This API returns `event` objects matching the query parameters.

### Parameters
- `since`\*: retrieve events that have started after this time
- `until`\*: retrieve events that have started before this time
- `nearLat`: retrieve events near this latitude
- `nearLong`: retrieve events near this Longitude
- `distance`: retrieve events within this distance (in meters) of  the specified location

\* - required parameter.

The `since` and `until` parameters must be within a week of each other.

If you are searching for events by location, the `nearLat`, `nearLong`, and `distance` parameters must all be set.

### Returns
This API returns a list of `event` objects in the following format:

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
}]
```

## GET /search/comments

This API returns `comment` objects attached to the specified event.

### Parameters
- `event_id`\*: the MongoDB Object ID for the event whose comments will be fetched

\* - required parameter.

### Returns
This API returns a list of `comment` objects in the following format:

```javascript
[{
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
}]
```
