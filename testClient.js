var request = require('request');

// sleep time expects milliseconds
function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * A function that has an endless loop to send a number of POST request to ask the server for log in process.
 * @param {*} num 
 */
async function loopRequest(num) {
    console.log(num);

    while (1) {
        sleep(500).then(() => {
            var options = {
                uri: 'http://localhost:8080/login',
                method: 'POST',
                json: { subject: 'login', id: 'id', pw: 'pw' }
            };

            /*
             * Send a POST request to use log in server
             */
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body) // Print the shortened url.
                }
            });
        });

        await sleep(500);

        request('http://localhost:8080/driver/:available', { method: 'GET' }, (err, res, body) => {
            console.log(body);
        })
    }
}

loopRequest(1);
loopRequest(2);
loopRequest(3);
loopRequest(4);
loopRequest(5);
loopRequest(6);
loopRequest(7);
loopRequest(8);
loopRequest(9);
loopRequest(10);
loopRequest(11);
loopRequest(12);
loopRequest(13);
loopRequest(14);
loopRequest(15);
loopRequest(16);
loopRequest(17);
loopRequest(18);
loopRequest(19);
loopRequest(20);
loopRequest(21);
loopRequest(22);
loopRequest(23);
loopRequest(24);
loopRequest(25);
loopRequest(26);
loopRequest(27);
loopRequest(28);
loopRequest(29);
loopRequest(30);
loopRequest(31);
loopRequest(32);
loopRequest(33);
loopRequest(34);
loopRequest(35);
loopRequest(36);
