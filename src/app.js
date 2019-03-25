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

//get connection
let conn = amqp.initConnection('amqp://localhost');

//initialise the channel
let channel = amqp.initChannel(conn);

let passport = require('passport');

var uberStrategy = require('passport-uber-v2').Strategy;

passport.use(
    new uberStrategy({
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: 'http://localhost:8080/callback'
    },
    function (accessToken, refreshToken, profile, done) {
        var user = profile;
        user.accessToken = accessToken;
        return done(null, user);
    }
));

app.use('/soap', require('./soapRouter'));

app.use('/service', require('./service'));

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