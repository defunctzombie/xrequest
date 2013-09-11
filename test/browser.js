var assert = require('assert');

var Request = require('../');

var cors_port = 0;

test('simple', function(done) {
    var req = new Request({
        uri: '/foobar'
    });

    req.once('data', function(data) {
        cors_port = data;
        assert.ok(!isNaN(cors_port - 0));
        done();
    });
});

test('cors', function(done) {
    var req = new Request({
        uri: '//localhost:' + cors_port + '/foobar'
    });

    req.once('data', function(data) {
        assert.equal(data, 'foobar');
        done();
    });
});
