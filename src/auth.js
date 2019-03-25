const express = require('express');
const router = express.Router();

let passport = require('./app').passport;

router.get('/', passport.authenticate('uber', { scope: ['profile'] }));

module.exports = router;