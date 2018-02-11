var express = require('express');
var config = require('../config');

var router = express.Router();

var api = require('../data/api')(config);
api.connect();

router.get('/events', function(req, res, next) {
    var getEvents = require('../api/events')(api);

    getEvents(function(events){
        if (events != null)
            res.json(events);
    });
});

module.exports = router;
