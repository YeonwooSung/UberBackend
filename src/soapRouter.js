const express = require('express');
const router = express.Router();

//TODO let channel = require('./app).channel;
let channel = require('./amqp').initChannel(''); //TODO uber url -> pub = ask uber API & sub = get uber API

router.get('/', (req, res) => {
    res.send('hi');
});

router.post('/', function (req, res) {
    req.setEncoding('utf8');
    console.log('hi');
    var request = req.body;
    console.log(request);

    res.send("yes");
});

module.exports = router;