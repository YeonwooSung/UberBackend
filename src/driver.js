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
    let messageObj = { subject: 'driverList' };

    let checker = true;

    // set the time out for no response from rpc server issue.
    let timeOut = setTimeout(() => {
        checker = false;
        res.end(JSON.stringify({title: 'RPC not running', msg: 'No response from RPC server!'}));
    }, 7000);

    amqp.send_RPC_message(JSON.stringify(messageObj), 'uber_rpc_queue')
        .then(msg => {
            const result = JSON.parse(msg.toString());
            //TODO error handling?
            if (checker) {
                clearTimeout(timeOut);
                res.json(result);
            }
        });
});

module.exports = router;