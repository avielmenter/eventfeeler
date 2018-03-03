var express = require('express');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;

function getCallbackURL(provider) {
    var url = 'http://';
    url += process.env.EVENTFEELER_HOSTNAME;
    if (process.env.PORT && process.env.EVENTFEELER_HOSTNAME == 'localhost')
        url += ':' + process.env.PORT;
    url += '/login/' + provider + '/return';

    return url;
}

module.exports = api => {
    passport.use(new TwitterStrategy({
            consumerKey: api.TWITTER_KEY,
            consumerSecret: api.TWITTER_SECRET,
            callbackURL: getCallbackURL('twitter')
        }, function(token, tokenSecret, profile, cb) {
            return cb(null, profile);
        }
    ));

    var router = express.Router();

    router.get('/:provider', function(req, res, next) {
        req.session.loginReturn = req.query.loginReturn;
        passport.authenticate('twitter')(req, res, next);
    });

    router.get('/:provider/return', function(req, res, next) {
        var loginReturn = req.session.loginReturn;
        if (loginReturn[0] != '/')
            loginReturn = '/' + loginReturn;
        delete req.session.loginReturn;

        passport.authenticate(req.params.provider, {
            successRedirect: loginReturn,
            failureRedirect: '/login/' + req.params.provider
        })(req, res, next);
    });

    return router;
};
