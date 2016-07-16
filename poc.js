/**
 * Created by jason on 7/12/16.
 */

var request = require('request');
var Sign = require('./signing');
var moment = require('moment');
//
// var current_date = moment().utc().format('YYYYMMDD[T]HHmmss[Z]');
//
//
// var request_options = {
//     //body: '',
//     headers: {
//         "X-Hyper-Date": current_date,
//         Host: 'us-west-1.hyper.sh:443',
//         "Content-Type": "application/json"
//
//     },
//     method: 'GET',
//     uri: 'https://us-west-1.hyper.sh/v1.23/containers/json'
// };
//
//
// var sign = new Sign({
//     accessKeyId: 'xxx',
//     body: request_options.body || '',
//     headers: request_options.headers,
//     method: request_options.method,
//     region: 'us-west-1',
//     service: 'hyper',
//     secretAccessKey: 'xxx',
//     url: request_options.uri
// });
// request_options.headers.Authorization = sign.toString();
// request_options.headers['User-Agent'] = 'Docker-Client/1.10.0-beta (darwin)';
//
// request(request_options, function (error, response, body) {
//     // Do more stuff with 'body' here
//     console.log(error);
//     console.log(response)
//     console.log(body)
// });


//////////////////TESTING CODE:



var request_options = {
    //body: '',
    headers: {
        "X-Hyper-Date": '20160716T092053Z',
        Host: 'us-west-1.hyper.sh:443',
        "Content-Type": "application/json"

    },
    method: 'GET',
    uri: 'https://us-west-1.hyper.sh/v1.23/containers/json?all=1'
};


var sign = new Sign({
    accessKeyId: 'xxx',
    body: request_options.body || '',
    headers: request_options.headers,
    method: request_options.method,
    region: 'us-west-1',
    service: 'hyper',
    secretAccessKey: 'xxx',
    url: request_options.uri
});
request_options.headers.Authorization = sign.toString();
console.log(request_options);

//Signature should = 52e9d1764d932743da355c5a972e9296a511a8d88f4bc124e0ca4bc21d75c3f9
//Signature actual = 308996360ca06a4c06b0b8a73bef1fedcff0b2a788a84aaef4214716449e7657

