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

            const content = msg.content.toString();

            let r = 'test';

            // start
            let tStart = Date.now();

            if (content.startsWith('login')) {

                //log in message
                r = processLogin(content);

            } else if (content.startsWith('register')) {

                //register message
                r = validateRegister(content);

            } else if (content == 'driverList') {

                //get available driver list
                r = JSON.stringify(getDriverList());

            } else {
                //error
                r = 'Error: invalid message!'
            }

            //TODO

            // finish
            let tEnd = Date.now();

            // to send object as a message,
            // you have to call JSON.stringify
            r = JSON.stringify({
                result: r,
                time: (tEnd - tStart)
            });

            ch.sendToQueue(msg.properties.replyTo,
                Buffer.from(r.toString(), 'utf8'),
                { correlationId: msg.properties.correlationId });
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
 * @param {*} msg 
 */
function processLogin(msg) {
    let splittedMsg = msg.split('/');

    let [ a, id, pw ] = splittedMsg;

    //TODO log in

    return '';
}


/**
 * A function to validate the register process.
 * @param {*} msg 
 */
function validateRegister(msg) {
    let splittedMsg = msg.split('/');

    let [a, name, id, pw, phoneNumber] = splittedMsg;

    //TODO validate the register process

    return '';
}