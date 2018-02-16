var express = require('express');
var config = require('../config');

var router = express.Router();

var api = require('../data/api')(config);

router.get('/events', function(req, res, next) {
    var eventsAPI = require('../api/events')(api, req.query);

    eventsAPI.get()
    .then(events => {
        res.json(events);
    })
    .catch(err => {
        console.log(err);
        res.status(500);
        res.send("ERROR");
    });
});

router.get('/comments', function(req, res, next) {
    var commentsAPI = require('../api/comments')(api, req.query);

    commentsAPI.get()
    .then(comments => {
        res.send(JSON.stringify(comments, null, '\t'));//res.json(comments)
    })
    .catch(err => {
        console.log(err);
        res.status(500);
        res.send("ERROR");
    });
});

module.exports = router;
