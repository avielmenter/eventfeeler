# EventFeeler API

EventFeeler objects can be requested by making an HTTP GET request to a page in the `api` directory. The following sections describe how each EventFeeler API can be accessed:

## /api/events

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
    name : String,  // name of the event
    description : String,   // description of the event
    categories : [String],  // list of event categories
    place : {   // where the event takes place
        name : String,  // name of the event's location
        loc : { // GeoJSON object describing the event's geographic location
            type : {type: String, default: 'Point'},
            coordinates: {type: [Number], default: [0, 0]},
        }
    },
    event_id : {type : String, unique : true},  // EventFeeler id for the event
    event_times: [{ // list of times the event takes place
        start_time: Date,       // time the event starts
        end_time: Date,         // time the event ends
        ticket_uri : String     // url to buy a ticket for this event time
    }]
}]
```
