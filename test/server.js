var http = require('http');

var server = http.createServer(function (req, res) {
    res.end('foobar');
});
server.listen(process.env.PORT);
