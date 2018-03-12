var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var expressLess = require('express-less');
var session = require('express-session');
var passport = require('passport');

var config = require('./config');
var api = require('./data/api')(config);

process.env.PORT = config.port;

var apiRouter = require('./routes/api')(api);
var reactRouter = require('./routes/react')(api);
var loginRouter = require('./routes/login')(api);

var app = express();

// ROUTING
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/', reactRouter);
app.use(express.static(__dirname + '/public'));
app.use('/styles', expressLess(__dirname + '/public/styles'));

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());
app.use(session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000}
}));
//app.use(cookieParser());

// PASSPORT SETUP
passport.serializeUser(function(user, cb) {
    api.connect();

    api.schemas.Users.save(user)
        .then(u => cb(null, u._id))
        .catch(err => cb(err, null));
});

passport.deserializeUser(function(id, cb) {
    api.connect();

    api.schemas.Users.load(id)
        .then(u => { cb(null, u); })
        .catch(err => { cb(err, null); });
});

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', apiRouter);
app.use('/login', loginRouter);

// ERROR HANDLING
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);

    console.error(err);

    if (err.status == 404)
        res.sendFile(__dirname + '/public/404.html');
    else
        res.sendFile(__dirname + '/public/500.html');
});

module.exports = app;
