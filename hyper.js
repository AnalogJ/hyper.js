var Docker = require('dockerode'),
    Modem = require('docker-modem'),
    Signer = require('./signer'),
    util = require('util'),
    url = require('url');

var _config = null;

//Override the Modem methods;
var orig_Modem_prototype_buildRequest = Modem.prototype.buildRequest;

Modem.prototype.buildRequest = function(options, context, data, callback) {

    //generate the url from the modem & _config options
    var request_url = url.format({
        protocol: _config.protocol,
        slashes: true,
        hostname: options.hostname,
        port: options.port,
        pathname: options.path
    });

    // options.headers["Content-Type"] = "application/json";
    var sign = new Signer({
        accessKeyId: _config.access_key,
        body: options.file || '',
        headers: options.headers,
        method: options.method,
        region: 'us-west-1',
        service: 'hyper',
        secretAccessKey: _config.secret_key,
        url: request_url
    });
    options.headers.Authorization = sign.toString();

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
    opts.port = opts.port || 443;
    opts.access_key = opts.access_key || process.env.HYPER_ACCESS_KEY;
    opts.secret_key = opts.secret_key || process.env.HYPER_SECRET_KEY;
    opts.version = 'v1.23';

    Hyper.super_.call(this, opts);
}

util.inherits(Hyper, Docker);

module.exports = Hyper;