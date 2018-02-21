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
            console.log(err);
            res.status(500);
            next();
        });
    });

    router.get('/:objType/:objID', function(req, res, next) {
        var path = '../api/' + req.params.objType;
        var reqAPI = require(path)(api, req.params.objID);

        reqAPI.get()
        .then(result => {
            res.json(result)
        })
        .catch(err => {
            console.log(err);
            res.status(500);
            next();
        });
    });

    return router;
};
