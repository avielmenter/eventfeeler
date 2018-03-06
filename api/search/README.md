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

## GET /search/recommendation

This API returns modified [`event`](https://github.com/avielmenter/eventfeeler/tree/master/data#event) objects that EventFeeler thinks the currently logged-in user will enjoy.

EventFeeler makes these recommendations based on the categories of events that the user has already attended. It then trains a Naive Bayes classifier to determine the probability that a user will like an event given the events' categories.

This API returns a list of events that it thinks the user would be most likely to enjoy in the specified period of time, sorted such that the event with the highest probability of being liked is first in the list.

### Parameters

- `days_out`: the API will return events from the current date up until this number of days in the future. If left blank, this parameter defaults to 7 days.
- `limit`: the number of events this API will return. If left blank, this parameter defaults to 10 items.

### Returns
This API returns a list of modified [`event`](https://github.com/avielmenter/eventfeeler/tree/master/data#event) objects.

Each [`event`](https://github.com/avielmenter/eventfeeler/tree/master/data#event) is modified by the addition of a single property, `probability`. This property represents the estimated probability the user will like the event. This number should probably not be shown to users directly. As a user will usually only attend a small number of events in a given category, the `probability` computed will likely be low in absolute terms.
