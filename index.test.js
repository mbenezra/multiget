var multiget = require('./'),
    parseUrl = require('url').parse,
    assert = require('assert'),
    http = require('http'),
    express = require('express');

function apiMiddleware(req, res) {
    var match = req.url.match(/api\/(users|countries|json|error)\/?(?:\:(\d+))?/);

    if (!match) {
        res.writeHead(404);
        return res.end();
    }

    var handle = match[1],
        id = match[2];

    if (handle === 'error') {
        res.writeHead(500);
        return res.end();
    }

    if (handle == 'json') {
        res.writeHead(200, {'Content-Type': 'application/json'});
        return res.end(JSON.stringify({
            foo: 'bar',
            arr: [1, 2, 3]
        }));
    }

    if (id) {
        res.end(handle + '_' + id);
    } else {
        res.end(handle + '_*');
    }
}

var api = express();
api.use(apiMiddleware);
api.listen(3001);


var app = express();
app.use(multiget('http://127.0.0.1:3001/'));
app.listen(3000);

function httpGet(url, callback) {
    http.get('http://127.0.0.1:3000/' + url, function (res) {
        var chunks = [];
        res.on('data', function (chunk) {
            chunks.push(chunk);
        });
        res.on('end', function () {
            callback({
                statusCode: res.statusCode,
                body: Buffer.concat(chunks).toString('utf8')
            });
        });
    });
}

describe('interface', function () {
    it('middleware should be a function', function () {
        assert.equal('function', typeof multiget);
        assert.equal('function', typeof multiget());
    });

});

describe('middleware', function () {

    describe('should handle queries that starts with "api/multi"', function () {
        it('api/multi', function (done) {
            httpGet('api/multi?users=api/users', function (responce) {
                assert.notEqual(responce.statusCode, 404, 'middleware is not handle api/multi* query');
                done();
            });
        });
        it('api/etc', function (done) {
            httpGet('api/etc?ad=123', function (responce) {
                assert.equal(responce.statusCode, 404);
                done();
            });
        });
    });

    describe('should handle multiple params', function () {

        it('few params', function (done) {
            httpGet('api/multi?users=api/users:1&countries=api/countries', function (responce) {
                assert.equal(responce.statusCode, 200);

                var data = JSON.parse(responce.body);
                assert.equal(data.users.result, 'users_1');
                assert.equal(data.countries.result, 'countries_*');
                done();
            });
        });

        it('should work when some api fails', function (done) {
            httpGet('api/multi?users=api/users&maybe-error=api/error', function (responce) {
                assert.equal(responce.statusCode, 200);

                var data = JSON.parse(responce.body);
                assert.equal(data.users.result, 'users_*');
                assert.equal(data['maybe-error'].error, 'API error: Internal Server Error');
                done();
            });
        });

        it('should work when api returns JSON', function (done) {
            httpGet('api/multi?users=api/users&json=api/json', function (responce) {
                assert.equal(responce.statusCode, 200);

                var data = JSON.parse(responce.body);

                assert.equal(data.users.result, 'users_*');

                var json = data.json.result;
                assert.equal(json.foo, 'bar');
                assert.deepEqual(json.arr, [1, 2, 3]);
                done();
            });
        });

    });
});
