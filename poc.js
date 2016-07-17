/**
 * Created by jason on 7/12/16.
 */

var request = require('request');
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TESTING r7kamura Code
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// //
// var r7kamuraSign = require('./r7kamura-signer');
//
// var r7kamura_options = {
//     //body: '',
//     headers: {
//         "X-Hyper-Date": '20160716T092053Z',
//         Host: 'us-west-1.hyper.sh:443',
//         "Content-Type": "application/json"
//
//     },
//     method: 'GET',
//     uri: 'https://us-west-1.hyper.sh/v1.23/containers/json?all=1'
// };
//
//
// var r7kamurasign = new r7kamuraSign({
//     accessKeyId: '6DPVZNO56L4WTR6NOKE6P9J3',
//     body: r7kamura_options.body || '',
//     headers: r7kamura_options.headers,
//     method: r7kamura_options.method,
//     region: 'us-west-1',
//     service: 'hyper',
//     secretAccessKey: 'EZrj887RxenSnRklKaPlwhroqa9qLPGhlLMqmAr3',
//     url: r7kamura_options.uri
// });
// r7kamura_options.headers.Authorization = r7kamurasign.toString();
// console.log(r7kamura_options);

// Signature should = Signature=52e9d1764d932743da355c5a972e9296a511a8d88f4bc124e0ca4bc21d75c3f9
// Signature actual = Signature=55e86a536ba87f85ed749c5963cc4afd3bd467bf99ef29680feb935e93222dc4

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TESTING carsales Code
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var carsalesSigner = require('./carsales-signer');

var carsales_request = {
    //body: '',
    requestHeaders: [
        {
            name:"X-Hyper-Date",
            value:'2016-07-16T09:20:53Z'
        },
        // Host: 'us-west-1.hyper.sh:443',
        {
            name:"Content-Type",
            value:"application/json"
        }
    ],
    requestBody: '',
    method: 'GET',
    url: 'https://us-west-1.hyper.sh/v1.23/containers/json?all=1'
};



var carsalessign = carsalesSigner(carsales_request,{
    accessKeyId: '6DPVZNO56L4WTR6NOKE6P9J3',
    region: 'us-west-1',
    service: 'hyper',
    secretAccessKey: 'EZrj887RxenSnRklKaPlwhroqa9qLPGhlLMqmAr3'
});


var headers = carsales_request.requestHeaders;
delete carsales_request.requestHeaders;
carsales_request.headers = {};
for(var ndx in headers){
    carsales_request.headers[headers[ndx]['name']] = headers[ndx]['value']
}
console.log('====request:')
console.log(carsales_request)
// request(carsales_request
// , function (error, response, bod                                                                                                                                                       cd                              y) {
//     // Do more stuff with 'body' here
//     console.log(error);
//     console.log(response)
//     console.log(body)
// });

// console.log(carsalessign);

//Signature should = Signature=52e9d1764d932743da355c5a972e9296a511a8d88f4bc124e0ca4bc21d75c3f9
//Signature actual = Signature=55e86a536ba87f85ed749c5963cc4afd3bd467bf99ef29680feb935e93222dc4
