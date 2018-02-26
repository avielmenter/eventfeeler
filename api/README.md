# EventFeeler API

EventFeeler objects can be requested by making an HTTP GET request to a page in the [`api`]() directory, or created and altered by making an HTTP POST request to the corresponding page.

Objects requested using the GET APIs must be identified using their unique database ID. This can be found in the `_id` field of the object.

The POST APIs can only be invoked when a user is logged in, in which case they will be invoked as that user. If no user is logged in, the API will return an HTTP 500 error.

The following sections describe how each EventFeeler API can be accessed.

## GET /event/:eventID

This API returns an [`event`](https://github.com/avielmenter/eventfeeler/tree/master/data#event) object matching the specified ID.

### Returns
This API returns an [`event`](https://github.com/avielmenter/eventfeeler/tree/master/data#event) object.

## GET /comment/:commentID

This API returns a [`comment`](https://github.com/avielmenter/eventfeeler/tree/master/data#comment) object matching the specified ID.

### Returns
This API returns a [`comment`](https://github.com/avielmenter/eventfeeler/tree/master/data#comment) object.

## POST /comment/:commentID?

This API creates or edits a comment in the database. If the ID is left blank, the API posts a new comment by the currently logged-in user. If the ID is specified, it edits the comment. The comment ID must refer to a comment the currently logged-in user has made.

### Parameters

This body of your POST request should contain a partially filled out [`comment`](https://github.com/avielmenter/eventfeeler/tree/master/data#comment) object in the following format:

```javascript
{
    text : String,              // the text of the comment
    event_id : String           // the ID of the event being commented upon
}
```

### Returns

This API returns the created or updated [`comment`](https://github.com/avielmenter/eventfeeler/tree/master/data#comment) object.

## GET /user/:userID

This API returns a [`user`](https://github.com/avielmenter/eventfeeler/tree/master/data#user) object matching the specified ID. If the ID entered is `current`, then the API returns a [`user`](https://github.com/avielmenter/eventfeeler/tree/master/data#user) object for the user currently logged in.

### Returns
This API returns a [`user`](https://github.com/avielmenter/eventfeeler/tree/master/data#user) object.

## POST /attending/:eventID

This API can be used to indicate that the currently logged-in user is or is not attending the event with the specified ID.

### Parameters

The body of your post request can contain the following optional parameter:

- `cancel`: If set, this parameter indicates that the user is not attending the event. If left false or blank, it indicates that the user is attending the event.


### Returns
This API returns the updated [`user`](https://github.com/avielmenter/eventfeeler/tree/master/data#user) object for the current user.
