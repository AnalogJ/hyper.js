var Docker = require('dockerode'),
    Modem = require('docker-modem'),
    aws4 = require('hyper-aws4'),
    util = require('util'),
    url = require('url'),
    fs = require('fs'),
    path = require('path')

var _config = null;

//Override the Modem methods;
var orig_Modem_prototype_buildRequest = Modem.prototype.buildRequest;

Modem.prototype.buildRequest = function(options, context, data, callback) {

    //generate the url from the modem & _config options
    var request_url = url.format({
        protocol: _config.protocol,
        slashes: true,
        hostname: options.hostname
        // pathname: options.path // this will incorrectly encode the '?' character.
    }) + options.path
    // options.headers["Content-Type"] = "application/json";

    console.log(request_url)
    console.log(options)
    var headers = aws4.sign({
        url: request_url,
        method: options.method.toUpperCase(),
        credential: {
            accessKey: _config.access_key,
            secretKey: _config.secret_key
        },
        headers: options.headers,
        body: data || ''
    });
    options.headers = headers;

    console.log(options.headers)

    orig_Modem_prototype_buildRequest.call(this, options, context, data, callback);
};


//Create a new Hyper constructor with default options and security keys
function Hyper(opts) {
    if(!opts){
        opts = {};
    }
    _config = opts;
    opts.protocol = opts.protocol || 'https';
    opts.host = opts.host || 'us-west-1.hyper.sh';
    opts.access_key = opts.access_key || process.env.HYPER_ACCESS_KEY;
    opts.secret_key = opts.secret_key || process.env.HYPER_SECRET_KEY;
    opts.version = 'v1.23';

    Hyper.super_.call(this, opts);
}

util.inherits(Hyper, Docker);

module.exports = Hyper;