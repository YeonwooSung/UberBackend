'use strict';

const amqp = require('amqplib');

const q = 'uber_rpc_queue';


//global variables for the csv file
let fs = require('fs');
let readline = require('readline');
let parse = require('json2csv').parse;
const FILE_EXIST = 'The \'user.csv\' file exists';


// list of the available drivers
let list = [{ name: 'James', phoneNumber: '078498765473', currentLocation: { latitude: 56.333333333333, longitude: -2.7833333333333 } }];


// Error messages
const LOGIN_ERROR = 'ERROR::LOGIN_ERROR: Cannot process the log in';
const REGISTER_ERROR = 'ERROR::REGISTER_ERROR: Cannot process the registration';
const INVALID_MSG = 'Error: invalid message!';
const FORMAT_ERROR = 'Error::FormatError: The message format is not a JSON!';
const FILE_ERROR = 'Error: Error while writing to the csv file';
const NO_REGISTERED_USER = 'ERROR::LOGIN_ERROR: No registered user';


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
                    r = INVALID_MSG;

                }

            } catch {
                r = FORMAT_ERROR;
            }

            // get the finish time
            let tEnd = Date.now();

            // to send object as a message, call JSON.stringify to convert the JSON object to string
            r = JSON.stringify({
                result: r,
                time: (tEnd - tStart)
            });


            // send the message to the message queue.
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
    return list;
}


/**
 * A function to validate the log in process.
 * @param {*} obj The message object that contains data for log in process.
 */
function processLogin(obj) {
    let {subject, id, pw} = obj;

    let r;

    if (subject == 'login' && id && pw) {
        r = readCSV(id, pw);
    } else {
        r = LOGIN_ERROR;
    }

    return r;
}


function readCSV(id, pw) {
    let result = NO_REGISTERED_USER;

    var lines = require('fs').readFileSync('./user.csv', 'utf-8')
        .split('\n')
        .filter(Boolean);

    console.log(lines.length);

    let newid = '\"' + id + '\"';
    let newpw = '\"' + pw + '\"';

    for (let i = 1; i < lines.length; i++) {
        let splitted = lines[i].split(',');

        if (splitted[1] == newid && splitted[2] == newpw) {
            result = `login_success/${id}`;

            break;
        }
    }

    return result;

}


/**
 * This function helps the rpc server to store the user data into the csv file.
 * @param {*} toCsv The data that should be written in the csv file.
 */
function appendToCSV(toCsv) {
    let ret = 'OK';

    fs.stat('user.csv', function (err, stat) {

        if (err == null) {
            console.log(FILE_EXIST);

            try {
                let csv = parse(toCsv);

                let data = '\n' + csv.split('\n')[1];

                fs.appendFile('user.csv', data, function (err) {
                    if (err) ret = FILE_ERROR;
                });

            } catch (err) {
                ret = FILE_ERROR;
                console.log(err);
            }

        } else {

            let fields = ['name', 'id', 'pw', 'phoneNumber'];

            let opts = { fields };

            try {
                const csv = parse(toCsv, opts);

                fs.writeFile('user.csv', csv, function (err, stat) {
                    if (err) ret = FILE_ERROR;
                });
            } catch (err) {
                ret = FILE_ERROR;
            }

        }
    });

    return ret;
}


/**
 * A function to validate the register process.
 * @param {*} obj The object that contains data for register process.
 */
function validateRegister(obj) {
    let {subject, name, id, pw, phoneNumber} = obj;

    let r;

    if (subject == 'register' && name && id && pw && phoneNumber) {
        let dataObj = {name: name, id: id, pw: pw, phoneNumber: phoneNumber};

        r = appendToCSV(dataObj);

    } else {
        r = REGISTER_ERROR;
    }

    return r;
}