var http = require('http');

var server2_port = 0;
var server2 = http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end('foobar');
});

var server = http.createServer(function (req, res) {
    res.end('' + server2_port);
});

server2.listen(function() {
    server2_port = server2.address().port;
    server.listen(process.env.PORT);
});

