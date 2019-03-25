const express = require('express');
const router = express.Router();

router.get('/', passport.authenticate('uber', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/');
});

module.exports = router;