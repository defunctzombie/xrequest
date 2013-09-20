var assert = require('assert');

var Request = require('../');

test('simple', function(done) {
    var req = new Request({
        uri: '/foobar'
    });

    req.once('data', function(data) {
        assert.equal(data, 'hello');
        done();
    });
});

// cors

var host = window.location.hostname;
var cors_host = 'ci.testling.com';

if (host === 'localhost') {
    cors_host = 'test.localhost';
}

if (window.location.port) {
    cors_host += ':' + window.location.port;
}

test('cors', function(done) {
    var req = new Request({
        uri: '//' + cors_host + '/foobar'
    });

    req.once('data', function(data) {
        assert.equal(data, 'hello');
        done();
    });
});
