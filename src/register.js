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
    /* 
     * Check the number of openned channels, and check if it is okay to open a new one.
     * This is basically for the message overloading issue.
     * To prevent the overloading issue, we need to limit the number of published messages.
     * And if the number of published messages is greater than limit, we should block the publisher to
     * stop publishing the messages.
     */
    if (amqp.checkNumOfChannels()) {
        res.json(JSON.stringify({ title: 'Too many requests', msg: 'The server is not be able to process your request now. Please try again later.' }));
    } else {
        let { userName, id, pw, phoneNum } = req.body;
        let messageObj = { subject: 'register', name: userName, id: id, pw: pw, phoneNumber: phoneNum };

        let checker = true;

        // set the time out for no response from rpc server issue.
        let timeOut = setTimeout(() => {
            checker = false;
            res.end(JSON.stringify({ title: 'RPC not running', msg: 'No response from RPC server!' }));
        }, 5000);

        amqp.send_RPC_message(JSON.stringify(messageObj), 'uber_rpc_queue_register')
            .then(msg => {
                const result = JSON.parse(msg.toString());

                if (checker) {
                    clearTimeout(timeOut);
                    res.json(result);
                }
            });
    }
});

module.exports = router;