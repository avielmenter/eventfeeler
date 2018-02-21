var express = require('express');
var config = require('../config');

var router = express.Router();

var api = require('../data/api')(config);

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

module.exports = router;
