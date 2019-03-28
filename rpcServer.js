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

            const n = parseInt(msg.content.toString());

            console.log(" [.] fib(%d)", n);

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
                new Buffer(r.toString()),
                { correlationId: msg.properties.correlationId });
            ch.ack(msg);
        })
    }
);
