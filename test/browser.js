var assert = require('assert');

var Request = require('../');

test('simple', function() {
    var req = new Request({
        uri: '/foobar'
    });

    req.once('data', function(data) {
        assert.equal(data, 'foobar');
    });
});
