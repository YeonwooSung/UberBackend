'use strict';

//import the library
const amqplib = require('amqplib');

// This queue name will be attached to "replyTo" property on producer's message,
// and the consumer will use it to know which queue to the response back to the producer
const REPLY_QUEUE = 'amq.rabbitmq.reply-to';

const EventEmitter = require('events');


//make a connection object to connect server and RabbitMQ
let conn = amqplib.connect('amqp://localhost');

/**
 * The aim of this function is to initialise the channel.
 *
 * @return {channel} The initialised channel
 */
let initChannel = () => conn.then(conn => conn.createChannel()) // create channel
    .then(ch => {
        ch.responseEmitter = new EventEmitter();
        ch.responseEmitter.setMaxListeners(0);
        ch.consume(REPLY_QUEUE,
            msg => ch.responseEmitter.emit(msg.properties.correlationId, msg.content),
            { noAck: true });

        return ch;
    });


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

    conn.then(conn => conn.createChannel()) // create channel
    .then(ch => {
        // make the queue durable, so that the message queue could be protected even when the queue crashed
        ch.assertQueue(rpcQueue, { durable: true });

        ch.responseEmitter = new EventEmitter();
        ch.responseEmitter.setMaxListeners(0);
        ch.consume(REPLY_QUEUE,
            msg => ch.responseEmitter.emit(msg.properties.correlationId, msg.content),
            { noAck: true }
        );

        // unique random string
        const correlationId = generateRandomId();

        ch.responseEmitter.once(correlationId, resolve);


        //send a message to the message queue with the given name
        ch.sendToQueue(rpcQueue, Buffer.from(message, 'utf8'), {
            correlationId,
            replyTo: REPLY_QUEUE,
            persistent: true //set persistent option to true to mark the messages as persistent
        });

        //close the channel after 5 seconds (5000 miliseconds)
        setTimeout(function() {
            ch.close();
        }, 5000);
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
