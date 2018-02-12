var EventSearch = require('facebook-events-by-location-core');
var axios = require('axios');

var fbPaging = require('./fbPaging');
var schemas = require('./schemas');

class fbEvents
{
    constructor(setAPI)
    {
        this.api = setAPI;
    }

    getURL(params)
    {
        if (params.lat == null || params.long == null || this.api.FB_ACCESS_TOKEN == null)
            return null;

        var url = this.api.FB_GRAPH + "type=place&center=" + params.lat + "," + params.long;

        if (params.distance !== undefined)
            url += "&" + params.distance;

        url += "&fields=name,events.order(" + (params.sort_descending ? "reverse_" : "") + "chronological)"

        if (params.since !== undefined)
            url += ".since(" + Date.parse(params.since) / 1000 + ")";
        if (params.until !== undefined)
            url += ".until(" + Date.parse(params.until) / 1000 + ")";
        if (params.eventLimit !== undefined)
            url += ".limit(" + params.eventLimit + ")"; /*/
        if (params.limit !== undefined)
            url += "&limit=" + params.limit;//*/

        console.log("Search for FB events: " + url);

        url += "&access_token=" + this.api.FB_ACCESS_TOKEN;
        return url;
    }

    get(params){ return new Promise((resolve, reject) => {
        var url = this.getURL(params);

        axios.get(
            url
        ).then(async function(response) {
            if (response.data === undefined)
                throw Error("No response.");

            var placeData = response.data;
            var events = [];

            while (placeData !== undefined && placeData !== null) { // for each place page
                for (let place of placeData.data) { // for each place
                    if (params.limit !== undefined && events.length >= params.limit)
                        break;

                    var placeEvents = place.events;

                    while(placeEvents !== undefined && placeEvents !== null) { // for each event page
                        for (let e of placeEvents.data) { // for each event
                            events[events.length] = e;
                            if (params.limit !== undefined && events.length >= params.limit)
                                break;
                        }

                        if (params.limit !== undefined && events.length >= params.limit)
                            break;

                        placeEvents = await fbPaging.next(placeEvents);
                    }
                }

                if (params.limit !== undefined && events.length >= params.limit)
                    break;

                placeData = await fbPaging.next(placeData);
            }

            resolve(events);
        }).catch(error => {
            reject(error);
        });
    });}

    save(events){ return new Promise((resolve, reject) => {
        this.api.connect();
        var inserts = Array();

        for (let e of events) {
            var schemaEvent = schemas.eventFromFacebook(e);

            inserts[inserts.length] = new Promise((res, rej) => {
                schemas.Events.findOneAndUpdate(
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
    });}
}

module.exports = api => new fbEvents(api);
