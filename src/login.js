const express = require('express');
const router = express.Router();

let amqp = require('./amqp');

router.get('/', (req, res) => {
    res.send('hi');
});


/**
 * Handle the POST request for the log in.
 */
router.post('/', (req, res) => {
    let { id, pw } = req.body;

    amqp.send_RPC_message(`login/${id}/${pw}`, 'uber_rpc_queue')
        .then(msg => {
            const result = JSON.parse(msg.toString());
            //TODO error handling?
            res.json(result);
        });
});

module.exports = router;