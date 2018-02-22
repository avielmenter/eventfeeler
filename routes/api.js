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

    router.get('/user/current', function(req, res, next) {
        console.log("REQUESTING USER: " + JSON.stringify(req.user));
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
        var path = '../api/' + req.params.objType;
        var reqAPI = require(path)(api, req.params.objID);

        if (!req.user)
            next(new Error("You must be logged in to use the POST APIs."));

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
