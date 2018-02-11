var express = require('express');
var mongoose = require('mongoose');

var router = express.Router();

/* GET users listing. */
router.get('/events', function(req, res, next) {
    var events_api = require('../api/events')(mongoose);

    events_api.getEvents(function(events){
        if (events != null)
            res.json(events);
    });
});

module.exports = router;
