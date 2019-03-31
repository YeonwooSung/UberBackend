const express = require('express');
const router = express.Router();

let amqp = require('./amqp');

router.get('/', (req, res) => {
    res.send('hi');
});


/**
 * Get the list of available drivers.
 * Router for '/driver/:available'.
 */
router.get('/:available', (req, res) => {
    amqp.send_RPC_message('driverList', 'uber_rpc_queue')
        .then(msg => {
            const result = JSON.parse(msg.toString());
            res.json(result);
        });
});

module.exports = router;