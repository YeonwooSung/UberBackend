const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    let url = 'https://login.uber.com/oauth/v2/authorize';
    res.send('hi');
});

module.exports = router;