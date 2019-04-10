var request = require('request');

var options = {
    uri: 'http://localhost:8080/login',
    method: 'POST',
    json: { subject: 'login', id: 'id', pw: 'pw' }
};

request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body) // Print the shortened url.
    }
});
