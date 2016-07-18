// from https://www.github.com/r7kamura/aws-signer-v4
var crypto = require('crypto');
var url = require('url');

/**
 * @class
 * @property {string} accessKeyId
 * @property {string} body
 * @property {object} headers
 * @property {string} method
 * @property {string=} region
 * @property {string} secretAccessKey
 * @property {string} url
 */
var Sign = function (configuration) {
    this.accessKeyId = configuration.accessKeyId;
    this.body = configuration.body;
    this.headers = configuration.headers;
    this.method = configuration.method;
    this.region = configuration.region;
    this.service = configuration.service;
    this.secretAccessKey = configuration.secretAccessKey;
    this.url = configuration.url;

    this.headers['X-Hyper-Content-Sha256'] = this._hexdigest(this.body || '');
    this._setCleanedDateHeader()

    log('>> Region: ' + this.region);
    log('>> Service: ' + this.service);
    log('>> Access Key Id: ' + this.accessKeyId);
    log('>> Secret Access Key: ' + this.secretAccessKey);
    log('>> Headers: ' + JSON.stringify(this.headers));
    log('>> Url: ' + this.url);

};

/**
 * @return {string}
 */
Sign.prototype.toString = function () {
    return [
        this._getCredential(),
        this._getSignedHeaders(),
        this._getSignature()
    ].join(', ');
};

/**
 * @return {string}
 */
Sign.prototype._getCanonicalHeaders = function () {
    var self = this;
    return Object.keys(this.headers).map(function (key) {
            var cleaned_key = key.toLowerCase()
            var cleaned_val = self.headers[key]//.replace(/^\s+|\s+$/g, '')
            if(cleaned_key == 'host' && cleaned_val.includes(':')){
                var port = cleaned_val.split(':')[1];
                if(port == "80" || port == "443"){
                    cleaned_val = cleaned_val.split(':')[0]
                }
            }

            return [cleaned_key,cleaned_val].join(':');
        }).sort().join('\n') + '\n';
};

/**
 * @return {string}
 */
Sign.prototype._getCanonicalHeaderKeys = function () {
    return Object.keys(this.headers).map(function (key) {
        return key.toLowerCase();
    }).sort().join(';')
};

/**
 * @return {string}
 */
Sign.prototype._getCanonicalRequest = function () {
    var canonicalRequest = [
        this.method,
        this._getPath(),
        this._getQuery(),
        this._getCanonicalHeaders(),
        this._getCanonicalHeaderKeys(),
        this._hexdigest(this.body || '')
    ].join('\n');
    log('>> Canonical Request: ' + canonicalRequest);
    return canonicalRequest
};

/**
 * @return {string}
 */
Sign.prototype._getCredential = function () {
    return 'HYPER-HMAC-SHA256 Credential=' + this.accessKeyId + '/' + this._getCredentialString();
};

/**
 * @return {string}
 */
Sign.prototype._getCredentialString = function () {
    return [
        this._getDateInShortString(),
        this._getRegion(),
        this._getService(),
        'hyper_request'
    ].join('/');
};

Sign.prototype._setCleanedDateHeader = function () {
    var dateHeader = this._getDateHeader();
    var date = null;
    if (dateHeader) {
        date = new Date(dateHeader);
    } else {
        date = new Date();
    }

    this.headers['X-Hyper-Date'] = date.toISOString().replace(/[:\-]|\.\d{3}/g, '')
}

/**
 * @return {string, undefined}
 */
Sign.prototype._getDateHeader = function () {
    return this.headers['X-Hyper-Date'] || this.headers['x-hyper-date'] || this.headers['X-HYPER-DATE'] ||
        this.headers.Date || this.headers.date || this.headers.DATE;
};

/**
 * @return {string}
 */
Sign.prototype._getDateInString = function () {
    return this._getDateHeader();
};

/**
 * @return {string}
 */
Sign.prototype._getDateInShortString = function () {
    return this._getDateInString().substr(0, 8);
};

/**
 * @return {string}
 */
Sign.prototype._getPath = function () {
    return url.parse(this.url).pathname.substring(1) //Hyper ignores the '/' prefix
};

/**
 * @return {string}
 */
Sign.prototype._getQuery = function () {
    var q = url.parse(this.url).query;
    if(!q){ return '';}
    return q.split('&').sort().join('&');
};

/**
 * @return {string}
 */
Sign.prototype._getRegion = function () {
    return this.region || url.parse(this.url).host.split('.')[1];
};

/**
 * @return {string}
 */
Sign.prototype._getService = function () {
    return this.service || url.parse(this.url).host.split('.', 2)[0];
};

/**
 * @return {string}
 */
Sign.prototype._getSignature = function () {
    kDate = this._hmac('HYPER' + this.secretAccessKey, this._getDateInShortString());
    kRegion = this._hmac(kDate, this._getRegion());
    kService = this._hmac(kRegion, this._getService());
    kCredentials = this._hmac(kService, 'hyper_request');
    signature = this._hexhmac(kCredentials, this._getStringToSign());

    return 'Signature=' + signature;
};

/**
 * @return {string}
 */
Sign.prototype._getSignedHeaders = function () {
    return 'SignedHeaders=' + this._getCanonicalHeaderKeys();
};

/**
 * @return {string}
 */
Sign.prototype._getStringToSign = function () {
    return [
        'HYPER-HMAC-SHA256',
        this._getDateInString(),
        this._getCredentialString(),
        this._hexdigest(this._getCanonicalRequest())
    ].join('\n');
};

/**
 * @param {string}
 * @param {string}
 * @return {string}
 */
Sign.prototype._hmac = function (key, value) {
    return crypto.createHmac('sha256', key).update(value).digest('binary');
};

/**
 * @param {string}
 * @return {string}
 */
Sign.prototype._hexdigest = function (key) {
    return crypto.createHash('sha256').update(key, 'utf8').digest('hex');
};

/**
 * @param {string}
 * @param {string}
 * @return {string}
 */
Sign.prototype._hexhmac = function (key, value) {
    return crypto.createHmac('sha256', key).update(value).digest('hex');
};


function log(msg) {
    process.env.DEBUG && console.log( msg);
}

module.exports = Sign;