var parseUrl = require('url').parse,
    http = require('http'),
    vow = require('vow'),
    QUERY_START = '/api/multi';

function httpGet(url, callback) {
    http
        .get(url, function (res) {
            var chunks = [];

            if (res.statusCode !== 200) {
                return callback(new Error('API error: ' + http.STATUS_CODES[res.statusCode]));
            }

            res
                .on('error', callback)
                .on('data', function (chunk) {
                    chunks.push(chunk);
                })
                .on('end', function () {
                    var body = Buffer.concat(chunks).toString('utf8');

                    if (res.headers['content-type'] === 'application/json') {
                        try {
                            body = JSON.parse(body);
                        } catch(e) {
                            return callback(e);
                        }
                    }

                    callback(null, body);
                });
        })
        .on('error', callback);
}

module.exports = function (apiHost) {

    return function (req, res, next) {

        if (req.url.indexOf(QUERY_START) !== 0) {
            return next();
        }

        var params = parseUrl(req.url, true).query;

        var promises = Object.keys(params).reduce(function (promises, key) {
            var promise = new vow.Promise(function (resolve) {
                httpGet(apiHost + params[key], function (err, result) {
                    if (err) {
                        resolve({error: err.message});
                    } else {
                        resolve({result: result});
                    }
                });
            });


            promises[key] = promise;
            return promises;
        }, {});

        vow.all(promises)
            .then(function (responces) {
                res.end(JSON.stringify(responces));
            })
            .fail(function (e) {
                res.writeHead(503);
                res.end(e.stack);
            });

    };
};
