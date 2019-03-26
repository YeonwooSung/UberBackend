'use strict';

//import the library
const amqplib = require('amqplib/callback_api');

// This queue name will be attached to "replyTo" property on producer's message,
// and the consumer will use it to know which queue to the response back to the producer
const REPLY_QUEUE = 'amq.rabbitmq.reply-to';

const EventEmitter = require('events');

/**
 * The aim of this function is to initialise the channel.
 *
 * @param url The url that should be connected.
 * @return {channel} The initialised channel
 */
let initChannel = (url) => {
    let ch = null;

    //connect to rabbitmq
    amqplib.connect(url, (err, conn) => {

        if (conn) { //check error

            // create channel
            conn.createChannel((err, channel) => {
                if (channel) {
                    channel.responseEmitter = new EventEmitter();
                    channel.responseEmitter.setMaxListeners(0);

                    channel.consume(REPLY_QUEUE,
                        msg => channel.responseEmitter.emit(msg.properties.correlationId, msg.content),
                        { noAck: true }
                    );

                    ch = channel;
                } else {
                    console.log(err);
                }
            });
        } else {
            console.log(err);
        }
    });

    return ch;
}

/**
 * Send RPC message.
 *
 * @param channel The channel to use
 * @param message The message that should be sent
 * @param rpcQueue The message queue
 */
let send_RPC_message = (channel, message, rpcQueue) => new Promise(resolve => {
    // unique random string
    const correlationId = generateRandomId();

    channel.responseEmitter.once(correlationId, resolve);
    channel.sendToQueue(rpcQueue, new Buffer(message), { correlationId, replyTo: REPLY_QUEUE });
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