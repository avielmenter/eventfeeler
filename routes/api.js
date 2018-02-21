var express = require('express');
var config = require('../config');

var router = express.Router();

var api = require('../data/api')(config);

router.get('/search/events', function(req, res, next) {
    var eventsAPI = require('../api/search/events')(api, req.query);

    eventsAPI.get()
    .then(events => {
        res.json(events);
    })
    .catch(err => {
        console.log(err);
        res.status(500);
        next();
    });
});

router.get('/search/comments', function(req, res, next) {
    var commentsAPI = require('../api/search/comments')(api, req.query);

    commentsAPI.get()
    .then(comments => {
        res.json(comments)
    })
    .catch(err => {
        console.log(err);
        res.status(500);
        next();
    });
});

module.exports = router;
