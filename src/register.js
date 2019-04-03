const express = require('express');
const router = express.Router();

let amqp = require('./amqp');

router.get('/', (req, res) => {
    res.send('hi');
});


/**
 * Handle the POST request to register a new user.
 */
router.post('/', (req, res) => {
    let { userName, id, pw, phoneNum } = req.body;
    let messageObj = { subject: 'register', name: userName, id: id, pw: pw, phoneNumber: phoneNum };

    amqp.send_RPC_message(JSON.stringify(messageObj), 'uber_rpc_queue')
        .then(msg => {
            const result = JSON.parse(msg.toString());
            //TODO error handling?
            res.json(result);
        });
});

module.exports = router;