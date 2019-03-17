const express = require('express');
const router = express.Router();

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