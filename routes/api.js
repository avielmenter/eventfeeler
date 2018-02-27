var express = require('express');

async function merge(api) {
    var eventsAPI = require('../api/search/events')(api, null);
    var oldIDs = [];
    var merged = [];

    api.connect();

    var events = await api.schemas.Events.model.find();
    console.log("Found " + events.length + " events");

    for (let e of events) {
        var same = await eventsAPI.findSame(e);
        if (!same || same.length <= 1)
            continue;

        console.log("FOUND " + (same.length - 1) + " DUPLICATES FOR EVENT '" + e.name + "'");

        var m = await eventsAPI.merge(same);
        merged.push(m);
    }

    return m;
}

module.exports = api => {
    var router = express.Router();

    router.get('/merge', function(req, res, next) {
        merge(api)
        .then(results => {
            res.json(results);
        })
        .catch(err => {
            next(err);
        });
    });

    router.get('/search/:apiPath', function(req, res, next) {
        var path = '../api/search/' + req.params.apiPath;
        var reqAPI = require(path)(api, req.query);

        reqAPI.get()
        .then(results => {
            res.json(results);
        })
        .catch(err => {
            next(err);
        });
    });

    router.get('/user/current', function(req, res, next) {
        res.json(req.user);
    });

    router.get('/:objType/:objID', function(req, res, next) {
        var path = '../api/' + req.params.objType;
        var reqAPI = require(path)(api, req.params.objID);

        reqAPI.get()
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            next(err);
        });
    });

    router.post('/:objType/:objID?', function(req, res, next) {
        if (!req.user)
            next(new Error("You must be logged in to use the POST APIs."));

        var path = '../api/' + req.params.objType;
        var reqAPI = require(path)(api, req.params.objID);

        reqAPI.post(req)
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            next(err);
        });
    });

    return router;
};
