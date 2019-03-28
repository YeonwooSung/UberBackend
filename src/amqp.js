'use strict';

//import the library
const amqplib = require('amqplib');

// This queue name will be attached to "replyTo" property on producer's message,
// and the consumer will use it to know which queue to the response back to the producer
const REPLY_QUEUE = 'amq.rabbitmq.reply-to';

const EventEmitter = require('events');

let channel;

/**
 * The aim of this function is to initialise the channel.
 *
 * @param url The url that should be connected.
 * @return {channel} The initialised channel
 */
let initChannel = (url) => amqplib.connect(url)
    .then(conn => conn.createChannel()) // create channel
    .then(ch => {
        ch.responseEmitter = new EventEmitter();
        ch.responseEmitter.setMaxListeners(0);
        ch.consume(REPLY_QUEUE,
            msg => ch.responseEmitter.emit(msg.properties.correlationId, msg.content),
            { noAck: true });

        channel = ch;

        return ch;
    });


/**
 * Send RPC message.
 *
 * @param channel The channel to use
 * @param message The message that should be sent
 * @param rpcQueue The message queue
 */
let send_RPC_message = (message, rpcQueue) => new Promise(resolve => {
    // unique random string
    const correlationId = generateRandomId();

    channel.responseEmitter.once(correlationId, resolve);

    channel.sendToQueue(rpcQueue, Buffer.from(message, 'utf8'), { correlationId, replyTo: REPLY_QUEUE });
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
module.exports.initChannel = initChannel;
