// from https://github.com/carsales/aws-request-signer/blob/master/src/signer.js
'use strict';
var CryptoJS = require('crypto-js');
var _ = require('lodash');
var urllib = require('url');
var algorithm = 'HYPER-HMAC-SHA256';
var hashedPayloads = new Array();

var enabled = false;
var region = '';
var service = '';
var accesskeyid = '';
var secretaccesskey = '';
var securitytoken = '';
var credentialtype_instanceprofile = false;
var credentialtype_explicit = false;

function valid() {
    if (!region || region.length === 0)
        return false;
    if (!service || service.length === 0)
        return false;
    if (!accesskeyid || accesskeyid.length === 0)
        return false;
    if (!secretaccesskey || secretaccesskey.length === 0)
        return false;

    return true;
}


function signRequest(request, options) {
    accesskeyid = options.accessKeyId;
    region = options.region;
    service = options.service;
    secretaccesskey = options.secretAccessKey;


    log('>> Region: ' + region);
    log('>> Service: ' + service);
    log('>> Access Key Id: ' + accesskeyid);
    log('>> Secret Access Key: ' + secretaccesskey);
    log('>> Security Token: ' + securitytoken);

    var amzDateTime = getAmzDateTime(request);
    log('>> AmzDateTime: ' + amzDateTime);

    var amzDate = amzDateTime.substr(0,8);
    var headers = request.requestHeaders;
    // headers.push({name:'X-Amz-Algorithm', value:algorithm});
    setDateHeader(request, amzDateTime);
    // headers.push({name:'X-Hyper-Date', value:amzDateTime});

    headers.push({name:'X-Hyper-Content-Sha256', value:getHashedPayload(request)});
    // this.headers['X-Hyper-Content-Sha256'] = this._hexdigest(this.body || '');


    var url = request.url;
    var host = getHost(url);
    log('>> Host: ' + host);

    headers.push({name:'Host', value:host});

    var canonicalRequest = getCanonicalRequest(request);
    log('>> Canonical Request: ' + canonicalRequest);

    var canonicalRequestHash = CryptoJS.SHA256(canonicalRequest);
    log('>> Canonical Request Hash: ' + canonicalRequestHash);

    var stringToSign = algorithm + '\n';
    stringToSign += amzDateTime + '\n';
    stringToSign += amzDate + '/' + region + '/' + service + '/' + 'hyper_request' + '\n';
    stringToSign += canonicalRequestHash;
    log('>> String To Sign: ' + stringToSign);

    var kDate = CryptoJS.HmacSHA256(amzDate, 'HYPER' + secretaccesskey);
    var kRegion = CryptoJS.HmacSHA256(region, kDate);
    var kService = CryptoJS.HmacSHA256(service, kRegion);
    var kKey = CryptoJS.HmacSHA256('hyper_request', kService);
    var signature = CryptoJS.HmacSHA256(stringToSign, kKey);
    log('>> Signature: ' + signature);

    var authorization = algorithm + ' ';
    authorization += 'Credential=' + accesskeyid + '/' + amzDate + '/' + region + '/' + service + '/' + 'hyper_request, ';
    authorization += 'SignedHeaders=' + getSignedHeaders(headers) + ', ';
    authorization += 'Signature=' + signature;
    log('>> Authorization: ' + authorization);

    headers.push({name:'Authorization', value:authorization});
    if (securitytoken)
        headers.push({name:'X-Amz-Security-Token', value:securitytoken});

    return headers;
}

function getHost(url) {
    return urllib.parse(url).host
}

function getDateHeader(request) {
    var header_value = _.find(request.requestHeaders, function(header) {
        return header.name == 'X-Hyper-Date' || header.name == 'x-hyper-date' || header.name == 'X-HYPER-DATE' ||
            header.name == 'Date' || header.name == 'date' || header.name == 'DATE';
    });
    return header_value ? header_value['value'] : null;
};

function setDateHeader(request, amzDateTime){
    var header_index = _.findIndex(request.requestHeaders, function(header) {
        return header.name == 'X-Hyper-Date' || header.name == 'x-hyper-date' || header.name == 'X-HYPER-DATE' ||
            header.name == 'Date' || header.name == 'date' || header.name == 'DATE';
    });

    if(header_index == -1){
        request.requestHeaders.push({name:'X-Hyper-Date', value:amzDateTime});
    }
    else{
        request.requestHeaders[header_index] = {name:'X-Hyper-Date', value:amzDateTime}
    }
}
function getAmzDateTime(request) {
    var date = null;
    var dateHeader = getDateHeader(request);
    if (dateHeader) {
        date = new Date(dateHeader);
    } else {
        date = new Date();
    }

    var amzDateTime = date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    return amzDateTime;
}
function getCanonicalRequest(request) {
    var url = request.url;
    var host = getHost(url);
    var method = request.method;
    var headers = request.requestHeaders;

    log('>> Url: ' + url);
    log('>> Host: ' + host);
    log('>> Method: ' + method);

    var canonicalPath = getCanonicalPath(url);
    var canonicalQuerystring = getCanonicalQueryString(url);
    var canonicalHeaders = getCanonicalHeaders(headers);
    var signedHeaders = getSignedHeaders(headers);
    var hashedPayload = getHashedPayload(request);

    log('>> Canonical Path: ' + canonicalPath);
    log('>> Canonical Querystring: ' + canonicalQuerystring);
    log('>> Canonical Headers: ' + canonicalHeaders);
    log('>> Signed Headers: ' + signedHeaders);
    log('>> Hashed Payload: ' + hashedPayload)

    var canonicalRequest = method + '\n';
    canonicalRequest += canonicalPath + '\n';
    canonicalRequest += canonicalQuerystring + '\n';
    canonicalRequest += canonicalHeaders + '\n';
    canonicalRequest += signedHeaders + '\n';
    canonicalRequest += hashedPayload; // hashedPayloads[request.requestId];

    return canonicalRequest;
}
function getCanonicalPath(url) {
    // var parser = document.createElement('a');
    // parser.href = url;
    // var uri = parser.pathname;
    // if (uri.length === 0)
    //     uri = '/';
    // else if (uri.substr(0,1) !== '/')
    //     uri = '/' + uri;
    //
    // // aws wants asterisk encoded
    // uri = uri.replace(/\*/g, '%2A');
    // return uri;
    return urllib.parse(url).pathname.substring(1);

}
function getCanonicalQueryString(url) {
    // var parser = document.createElement('a');
    // parser.href = url;
    // var querystring = parser.search;
    // var params = querystring.split('&');
    // for (var i=0; i<params.length; i++) {
    //     if (params[i].substr(0,1) === '?')
    //         params[i] = params[i].substr(1, params[i].length-1);
    // }
    //
    // var sortedParams = params.sort();
    // var canonicalQuerystring = sortedParams.join('&');
    // return canonicalQuerystring;
    var q = urllib.parse(url).query;
    if(!q){ return '';}
    return q.split('&').sort().join('&');
}
function getCanonicalHeaders(headers) {
    var aggregatedHeaders = new Array();
    for (var i=0; i<headers.length; i++) {
        var name = headers[i].name.toLowerCase();

        if (name.indexOf('x-devtools-') > -1)
            continue;

        var headerfound = false;
        for (var x=0; x<aggregatedHeaders.length; x++) {
            if (aggregatedHeaders[x].substr(0,name.length) === name) {
                aggregatedHeaders[x] += headers[i].value.trim();
                headerfound=true;
                break;
            }
        }

        if (!headerfound)
            aggregatedHeaders.push(name + ':' + headers[i].value);
    }
    var sortedHeaders = aggregatedHeaders.sort(function(a,b) {
        var name1 = a.substr(0,a.indexOf(':'));
        var name2 = b.substr(0,b.indexOf(':'));
        return name1 > name2;
    });
    var canonicalHeaders = sortedHeaders.join('\n');
    return canonicalHeaders + '\n';
}
function getSignedHeaders(headers) {
    var signedHeaders = new Array();
    for (var i=0; i<headers.length; i++) {
        var name = headers[i].name.toLowerCase();
        if (name.indexOf('x-devtools-') > -1)
            continue;
        signedHeaders.push(name);
    }
    var sortedHeaders = signedHeaders.sort();
    return sortedHeaders.join(';');
}
function getHashedPayload(request) {
    var body = request.requestBody;
    if (body && body.raw && body.raw.length > 0 && body.raw[0].bytes) {
        var str = String.fromCharCode.apply(String, new Uint8Array(body.raw[0].bytes));
        log('>> Raw Payload: ' + str);
        return CryptoJS.SHA256(str);
    }

    return CryptoJS.enc.Hex.stringify(CryptoJS.SHA256(''));
    //return CryptoJS.SHA256('');
}
function log(msg) {
    console.log( msg);
}

module.exports = signRequest;