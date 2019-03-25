'use strict';

//import the library
const amqplib = require('amqplib/callback_api');

// This queue name will be attached to "replyTo" property on producer's message,
// and the consumer will use it to know which queue to the response back to the producer
const REPLY_QUEUE = 'amq.rabbitmq.reply-to';

const EventEmitter = require('events');


/**
 * Create the amqp channel.
 *
 * @param url The url that should be connected.
 * @return {conn} The initialised connection
 */
let initConnection = (url) => {
    let con = null;

    //connect to rabbitmq
    amqplib.connect(url, (err, conn) => {

        if (conn) { //check error
            con = conn;
        } else {
            console.log(err);
            con = undefined;
        }
    });

    return con;
}


/**
 * Initialise the channel from the given connection.
 *
 * @param {@object} conn The connection object.
 * @return The initialised channel
 */
let initChannel = (conn) => {
    if (conn) {
        let ch;

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
                ch = undefined;
            }
        });

        return ch;
    } else {
        console.log('The connection object is undefined!');

        return undefined;
    }
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
module.exports.initConnection = initConnection;