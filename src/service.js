const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('hi');
});

router.post('/lookup', (req, res) => {
    res.send('hello');
});

router.post('/discovery', (req, res) => {
    res.send('hello');
});

router.post('/access', (req, res) => {
    res.send('hello');
});

module.exports = router;