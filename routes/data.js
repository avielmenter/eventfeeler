var stringify = require('json-stringify-safe');

var express = require('express');
var config = require('../config');

var router = express.Router();

var api = require('../data/api')(config);

router.get('/fbEvents', function(req, res, next) {
    var eventsAPI = require('../data/fbEvents')(api);

    var params = {};
    params.lat = 33.6459816;
    params.long = -117.8427147;
    params.since = '2018-02-01';
    params.until = '2018-03-01';
    params.limit = 20;
    params.distance = 1000;

    eventsAPI.get(
        params
    )
    .then(async function(events) {
        await eventsAPI.save(events);
//        res.send(JSON.stringify(events, null, '\t'));
        res.json({status: "success"});
    })
    .catch(err => {
        console.log(err);
        res.json({status: "error", error: err});
    });
});

module.exports = router;
