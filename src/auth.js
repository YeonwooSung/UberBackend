const express = require('express');
const router = express.Router();

let passport = require('./app').passport;

router.get('/', (req, res) => {
    res.send('hi');
});

module.exports = router;
