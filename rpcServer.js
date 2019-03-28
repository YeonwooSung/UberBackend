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

            const content = parseInt(msg.content.toString());

            // start
            let tStart = Date.now();

            //TODO rpc section
            let r = 'test';

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
