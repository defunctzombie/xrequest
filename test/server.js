var http = require('http');

var server = http.createServer(function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end('hello');
});

server.listen(process.env.PORT);
