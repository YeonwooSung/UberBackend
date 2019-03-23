'use strict';

//import the library
const amqplib = require('amqplib');

// This queue name will be attached to "replyTo" property on producer's message,
// and the consumer will use it to know which queue to the response back to the producer
const REPLY_QUEUE = 'amq.rabbitmq.reply-to';

const EventEmitter = require('events');


/**
 * Create the amqp channel.
 *
 * @param url The url that should be connected.
 * @return {channel} The initialised channel
 */
initChannel = (url) => {
    return amqplib.connect(url)
        .then(conn => conn.createChannel()) // create channel
        .then(channel => {
            channel.responseEmitter = new EventEmitter();
            channel.responseEmitter.setMaxListeners(0);

            channel.consume(REPLY_QUEUE,
                msg => channel.responseEmitter.emit(msg.properties.correlationId, msg.content),
                { noAck: true }
            );

            return channel; //return the initialised channel
        });
}


/**
 * Basically, this function generates a string of random numbers that will be used for uuid.
 */
generateRandomId = () => {
    return Math.random().toString() + Math.random().toString() + Math.random().toString();
}


module.exports.generateRandomId = generateRandomId;
module.exports.initChannel = initChannel;