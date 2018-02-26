# EventFeeler API

EventFeeler objects can be searched by making an HTTP GET request to a page in the `api/search` directory. The following sections describe how each EventFeeler search API can be accessed.

## GET /search/events

This API returns [`event`](https://github.com/avielmenter/eventfeeler/tree/master/data#event) objects matching the query parameters.

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
This API returns a list of [`event`](https://github.com/avielmenter/eventfeeler/tree/master/data#event) objects.

## GET /search/comments

This API returns [`comment`](https://github.com/avielmenter/eventfeeler/tree/master/data#comment) objects attached to the specified event.

### Parameters
- `event_id`\*: the MongoDB Object ID for the event whose comments will be fetched

\* - required parameter.

### Returns
This API returns a list of [`comment`](https://github.com/avielmenter/eventfeeler/tree/master/data#comment) objects.
