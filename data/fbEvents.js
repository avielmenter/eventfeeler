var EventSearch = require('facebook-events-by-location-core');
var axios = require('axios');

var fbPaging = require('./fbPaging');
var schemas = require('./schemas');

class fbEvents
{
    constructor(setAPI)
    {
        this.api = setAPI;
        this.lat = 33.6459816;      // coordinates for the center of Aldritch park
        this.long = -117.8427147;
        this.distance = 1000;
    }

    getURL()
    {
        if (this.lat == null || this.long == null || this.api.FB_ACCESS_TOKEN == null)
            return null;

        var url = this.api.FB_GRAPH + "type=place&center=" + this.lat + "," + this.long;

        if (this.distance !== undefined)
            url += "&" + this.distance;

        url += "&fields=name,events.order(" + (this.sort_descending ? "reverse_" : "") + "chronological)"

        if (this.since !== undefined)
            url += ".since(" + Date.parse(this.since) / 1000 + ")";
        if (this.until !== undefined)
            url += ".until(" + Date.parse(this.until) / 1000 + ")";
        if (this.eventLimit !== undefined)
            url += ".limit(" + this.eventLimit + ")";
        if (this.limit !== undefined)
            url += "&limit=" + this.limit;

        console.log("Search for FB events: " + url);

        url += "&access_token=" + this.api.FB_ACCESS_TOKEN;
        return url;
    }

    async get() {
        var url = this.getURL();

        var response = await axios.get(url);
        if (response.data === undefined)
            throw Error("No response.");

        var placeData = response.data;
        var events = [];

        while (placeData !== undefined && placeData !== null) { // for each place page
            for (let place of placeData.data) { // for each place
                var placeEvents = place.events;

                while(placeEvents !== undefined && placeEvents !== null) { // for each event page
                    for (let e of placeEvents.data) { // for each event
                        events[events.length] = e;
                        if (this.limit !== undefined && events.length >= this.limit)
                            return events;
                    }
                    
                    placeEvents = await fbPaging.next(placeEvents);
                }
            }

            placeData = await fbPaging.next(placeData);
        }

        return events;
    }

    async save(events) {
        this.api.connect();
        var inserts = Array();

        for (let e of events) {
            var schemaEvent = schemas.eventFromFacebook(e);

            inserts[inserts.length] = new Promise((res, rej) => {
                var eventModel = this.api.mongoose.model('events', schemas.Events);

                eventModel.findOneAndUpdate(
                    { 'event_id' : schemaEvent.event_id },
                    schemaEvent,
                    { 'upsert': true },
                    function(err, prev) {
                        if (err)
                            rej(err);
                        else
                            res();
                    }
                );
            });
        }

        Promise.all(inserts)
        .then(() => {
            resolve();
        })
        .catch((err) => {
            reject(err);
        });
    }
}

module.exports = api => new fbEvents(api);
