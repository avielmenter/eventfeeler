var express = require('express');
var passport = require('passport');

var TwitterStrategy = require('passport-twitter').Strategy;
var FacebookStrategy = require('passport-facebook2').Strategy;

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
            callbackURL: getCallbackURL('twitter'),
            passReqToCallback: true
        }, function(req, token, tokenSecret, profile, cb) {
            if (!req.user || !req.session.mergeLogins)
                return cb(null, profile);

            delete req.session.mergeLogins;

            api.schemas.Users.merge(req.user, profile)
                .then(newUser => cb(null, profile))
                .catch(err => cb(err, null));
        }
    ));

    passport.use(new FacebookStrategy({
            clientID: api.config.FB_APP_ID,
            clientSecret: api.config.FB_APP_SECRET,
            callbackURL: getCallbackURL('facebook'),
            enableProof: false,
            passReqToCallback: true
        }, function(req, accessToken, refreshToken, profile, cb) {
            if (!req.user || !req.session.mergeLogins)
                return cb(null, profile);

            delete req.session.mergeLogins;

            api.schemas.Users.merge(req.user, profile)
                .then(newUser => cb(null, profile))
                .catch(err => cb(err, null));
        }
    ));

    var router = express.Router();

    router.get('/failed', function(req, res, next) {
        var loginReturn = req.session.loginReturn;
        if (loginReturn[0] != '/')
            loginReturn = '/' + loginReturn;
        delete req.session.loginReturn;

        res.redirect(loginReturn);
    });

    router.get('/:provider/merge', function(req, res, next) {
        req.session.loginReturn = req.query.loginReturn;
        req.session.mergeLogins = true;

        passport.authorize(req.params.provider)(req, res, next);
    });

    router.get('/:provider', function(req, res, next) {
        req.session.loginReturn = req.query.loginReturn;
        req.session.mergeLogins = false;

        passport.authenticate(req.params.provider)(req, res, next);
    });

    router.get('/:provider/return', function(req, res, next) {
        var loginReturn = req.session.loginReturn;
        if (!loginReturn || loginReturn[0] != '/')
            loginReturn = '/' + loginReturn;
        delete req.session.loginReturn;

        var merge = req.session.mergeLogins;

        var redirects = {
            successRedirect: loginReturn,
            failureRedirect: loginReturn,
            failureFlash: true
        };

        if (!merge)
            passport.authenticate(req.params.provider, redirects)(req, res, next);
        else
            passport.authorize(req.params.provider, redirects)(req, res, next);
    });

    return router;
};
