var express = require('express');
var config = require('../config');

var router = express.Router();

var api = require('../data/api')(config);

router.get('/events', function(req, res, next) {
    var eventsAPI = require('../api/events')(api);

    eventsAPI.get
    .then(events => {
        res.json(events);
    })
    .catch(err => {
        res.json(err);
    });
});

module.exports = router;
