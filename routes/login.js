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

    router.get('/twitter', passport.authenticate('twitter'));
    router.get('/twitter/return', passport.authenticate('twitter', {failureRedirect: '/login/twitter' }),
    function(req, res) {
        res.redirect('/');
    });

    return router;
};
