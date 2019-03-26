'use strict'

//import required libraries
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let app = express();

const bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);


//basic set ups
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//TODO

let amqp = require('./amqp');

//initialise channel
let channel = amqp.initChannel('amqp://localhost');


let passport = require('passport');
let cookieSession = require('cookie-session');
let flash = require('connect-flash');

const AGE = 1000 * 60 * 60 * 24; // max age = 24 hours

//use cookie session
app.use(cookieSession({
    keys: ['uber_mom'],
    cookie: {
        maxAge: AGE
    }
}));

app.use(flash());


//import uber strategy for uber authentication
var uberStrategy = require('passport-uber-v2').Strategy;

//use passport strategy for authenticating with uber by using OAuth 2.0 API.
passport.use(
    new uberStrategy({
        clientID: 'CLIENT_ID',
        clientSecret: 'CLIENT_SECRET',
        callbackURL: 'http://localhost:8080/callback'
    },
    function (accessToken, refreshToken, profile, done) {
        var user = profile;
        user.accessToken = accessToken;
        return done(null, user);
    }
));


//add routers
app.use('/soap', require('./soapRouter'));

app.use('/service', require('./service'));


app.get('/callback', passport.authenticate('uber', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/');
    }
);


app.use('/login', require('./login'));
app.use('/auth', require('./auth'));

//TODO


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});


// error handler
app.use(function (err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports.app = app;
module.exports.channel = channel;