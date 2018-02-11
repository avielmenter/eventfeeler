var express = require('express');
var config = require('../config');

var router = express.Router();

/* GET users listing. */
router.get('/events', function(req, res, next) {
    var events_api = require('../api/events')(config);

    events_api.getEvents(function(events){
        if (events != null)
            res.json(events);
    });
});

module.exports = router;
