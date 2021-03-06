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


let amqp = require('./amqp');

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
    )
);


/**
 * Callback page for uber authentication process.
 */
app.get('/callback', passport.authenticate('uber', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/');
    }
);


/**
 * GET - test page
 */
app.get('/test', (req, res) => {
    do_RPC_Test(res);
});


/**
 * A test function to send and receive a test message to/from the rpc server.
 * @param {*} res 
 */
function do_RPC_Test(res) {
    let messageObj = { subject: 'test' };

    amqp.send_RPC_message(JSON.stringify(messageObj), 'uber_rpc_queue')
    .then(msg => {
        const result = JSON.parse(msg.toString());
        res.json(result);
    });
}

app.use('/login', require('./login'));
app.use('/register', require('./register'));
app.use('/driver', require('./driver'));


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