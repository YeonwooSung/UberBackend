'use strict';

const amqp = require('amqplib');

const q = 'uber_rpc_queue';

amqp.connect('amqp://localhost')
    .then(conn => {
        return conn.createChannel();
    })
    .then(ch => {

        ch.assertQueue(q, { durable: false });
        ch.prefetch(1);
        console.log(" [x] Awaiting RPC Requests");

        ch.consume(q, msg => {

            const contentStr = msg.content.toString();

            let r = 'test';

            // start time
            let tStart = Date.now();

            try {

                let content = JSON.parse(contentStr);

                if (content['subject'] == 'login') {

                    //log in message
                    r = processLogin(content);

                } else if (content['subject'] == 'register') {

                    //register message
                    r = validateRegister(content);

                } else if (content['subject'] == 'driverList') {

                    //get available driver list
                    r = JSON.stringify(getDriverList());

                } else if (content['subject'] == 'test') {
                    r = 'test';
                } else {

                    //error
                    r = 'Error: invalid message!'

                }

            } catch {
                r = 'Error::FormatError: The message format is not a JSON!'
            }

            //TODO

            // finish
            let tEnd = Date.now();

            // to send object as a message, call JSON.stringify to convert the JSON object to string
            r = JSON.stringify({
                result: r,
                time: (tEnd - tStart)
            });

            ch.sendToQueue(msg.properties.replyTo,
                Buffer.from(r.toString(), 'utf8'),
                { correlationId: msg.properties.correlationId }
            );

            ch.ack(msg);
        })
    }
);


/**
 * A function that gets the list of available drivers.
 */
function getDriverList() {
    let list = [{ name: 'James', phoneNumber: '078498765473', currentLocation: { latitude: 56.333333333333, longitude: -2.7833333333333}}];

    return list;
}


/**
 * A function to validate the log in process.
 * @param {*} obj The message object that contains data for log in process.
 */
function processLogin(obj) {
    let {subject, id, pw} = obj;

    //TODO log in

    return '';
}


/**
 * A function to validate the register process.
 * @param {*} obj The object that contains data for register process.
 */
function validateRegister(obj) {
    let {subject, name, id, pw, phoneNumber} = obj;

    //TODO validate the register process

    return '';
}