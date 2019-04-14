'use strict';

//import the library
const amqplib = require('amqplib');

// This queue name will be attached to "replyTo" property on producer's message,
// and the consumer will use it to know which queue to the response back to the producer
const REPLY_QUEUE = 'amq.rabbitmq.reply-to';

const EventEmitter = require('events');


//make a connection object to connect server and RabbitMQ
let conn = amqplib.connect('amqp://localhost', {
    noDelay: true //add noDelay option to use no delay tcp socket.
});

//TODO
let numOfChannels = 0;

let checkNumOfChannels = () => {
    if (numOfChannels > 1000) {
        return true;
    } else {
        return false;
    }
}

//TODO


/**
 * Send RPC message.
 *
 * @param channel The channel to use
 * @param message The message that should be sent
 * @param rpcQueue The message queue
 *
 * @return {Promise} new promise instance
 */
let send_RPC_message = (message, rpcQueue) => new Promise(resolve => {

    // open channel to send RPC message to the RPC server.
    conn.then(con => {
        con.on('error', (err) => {
            console.log('RabbitMQ server is down now!');

            console.log('\n\nTry to reconnect....')
            conn = amqplib.connect('amqp://localhost');
        });

        return con.createChannel() // create channel
    })
    .then(ch => {

        ch.responseEmitter = new EventEmitter();
        ch.responseEmitter.setMaxListeners(0);

        numOfChannels += 1;

        ch.on('close', () => {
            numOfChannels -= 1;
        });

        ch.on('error', (err) => {
            console.log(err);

            console.log('Requeue unacknowledged messages on this channel.');

            // Requeue unacknowledged messages on this channel.
            ch.recover(); //TODO is this the correct way??
        });

        //close the channel after 3 seconds (3000 miliseconds)
        setTimeout(function() {
            ch.close();
        }, 3000);

        ch.consume(REPLY_QUEUE,
            msg => {
                if (msg) {
                    ch.responseEmitter.emit(msg.properties.correlationId, msg.content)
                } else {
                    console.log('No message to consume!');
                }
            },
            { noAck: true }
        );

        // unique random string, which will be used to distinguish the reply message
        const correlationId = generateRandomId();

        /*
         * EventEmitter.once(eventName, listener) runs the listener when the event with the given name has been occurred.
         * Henceforth, by using the unique random string, we could distinguish the reply message that we are looking for.
         */
        ch.responseEmitter.once(correlationId, resolve);


        //send a message to the message queue with the given name
        ch.sendToQueue(rpcQueue, Buffer.from(message, 'utf8'), {
            correlationId,
            replyTo: REPLY_QUEUE,
            persistent: true //set persistent option to true to mark the messages as persistent
        });

    });

});


/**
 * Basically, this function generates a string of random numbers that will be used for uuid.
 */
let generateRandomId = () => {
    return Math.random().toString() + Math.random().toString() + Math.random().toString();
}


//export functions

module.exports.generateRandomId = generateRandomId;
module.exports.send_RPC_message = send_RPC_message;
module.exports.checkNumOfChannels = checkNumOfChannels;
