    var express = require('express');

module.exports = api => {
    var router = express.Router();

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

    router.post('/user/current/attending', function(req, res, next) {
        if (!req.user)
            next(new Error("You must be logged in to use the POST APIs"));

        var path = '../api/user';
        var userAPI = require(path)(api, req.user._id);

        var attending = !req.body.cancel;
        var event_id = req.body.event_id;

        userAPI.attend(event_id, attending)
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            next(err);
        });
    });

    router.post('/user/:userID/attending', function(req, res, next){
        next(new Error("Event attendance can only be changed for the currently logged-in user."));
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
