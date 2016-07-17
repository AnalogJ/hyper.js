// var Docker = require('dockerode');
// var docker = new Docker({host: 'http://us-west-1.hyper.sh', port: 443});
// docker.listContainers(function (err, containers) {
//     if(err){
//         console.log("ERROR:", err)
//         return
//     }
//
//     containers.forEach(function (containerInfo) {
//         docker.getContainer(containerInfo.Id).stop(cb);
//     });
// });

var r7kamuraSign = require('./r7kamura-signer');
var Modem = require('docker-modem');
var request = require('request')




var request_options = {
    //body: '',
    headers: {
        // "X-Hyper-Date": new Date().toISOString(),
        Host: 'us-west-1.hyper.sh:443',
        "Content-Type": "application/json"

    },
    method: 'GET',
    uri: 'https://us-west-1.hyper.sh/v1.23/containers/json?all=1'
};


var sign = new r7kamuraSign({
    accessKeyId: process.env.HYPER_ACCESS_KEY,
    body: request_options.body || '',
    headers: request_options.headers,
    method: request_options.method,
    region: 'us-west-1',
    service: 'hyper',
    secretAccessKey: process.env.HYPER_SECRET_KEY,
    url: request_options.uri
});
request_options.headers.Authorization = sign.toString();
// request(request_options, function (error, response, body) {
//     // Do more stuff with 'body' here
//     // console.log(error);
//     // console.log(response)
//     // console.log(body)
// });
console.log(request_options)


//override the Modem prototype
// Modem.prototype.buildRequest = function(options, context, data, callback) {
//     console.log(arguments)
// }

var modem = new Modem({
    host: 'us-west-1.hyper.sh',
    port: 443,
    protocol: 'https'
});

modem.dial({
    path: '/v1.23/containers/json?',
    method:'GET',
    headers: request_options.headers,
    statusCodes:{200:'success allowed'},
    options: {'all':'1'}

}, function(){
    console.log(arguments)
})