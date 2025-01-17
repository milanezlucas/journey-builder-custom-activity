'use strict';

const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
const util = require('util');
const axios = require('axios');

exports.logExecuteData = [];

function logData(req) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path,
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });
    
    console.log("body: " + util.inspect(req.body));
    console.log("headers: " + util.inspect(req.headers));
    console.log("trailers: " + req.trailers);
    console.log("method: " + req.method);
    console.log("url: " + req.url);
    console.log("params: " + util.inspect(req.params));
    console.log("query: " + util.inspect(req.query));
    console.log("route: " + req.route);
    console.log("cookies: " + req.cookies);
    console.log("ip: " + req.ip);
    console.log("path: " + req.path);
    console.log("host: " + req.host);
    console.log("fresh: " + req.fresh);
    console.log("stale: " + req.stale);
    console.log("protocol: " + req.protocol);
    console.log("secure: " + req.secure);
    console.log("originalUrl: " + req.originalUrl);
}

exports.edit = function (req, res) {
    console.log('edit request');
    // logData(req);
    res.send(200, 'Edit');
};

exports.save = function (req, res) {
    console.log('save request');
    // logData(req);
    res.send(200, 'Save');
};

exports.execute = function (req, res) {
    // logData(req);
    JWT(req.body, process.env.jwtSecret, (err, decoded) => {
        if (err) {
            console.error(err);
            return res.status(401).end();
        }

        // console.log('buffer hex', req.body.toString('hex'));

        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            var decodedArgs = decoded.inArguments[0];
            // console.log('inArguments', JSON.stringify(decoded.inArguments));
            // console.log('decodedArgs', JSON.stringify(decodedArgs));

            const callme = decodedArgs['callMeOrigin'];
            const phone = decodedArgs['telefone'];
            const name = decodedArgs['nome'];
            const email = decodedArgs['email'];

            console.log('callme', callme);
            console.log('phone', phone);
            console.log('name', name);
            console.log('email', email);

            const headers = {
                'Content-Type': 'application/json'
            }

            const post_save = {
                "name": name,
                "email": email,
                "phone": phone,
                "callme": callme
            }

            axios.post('https://experimente.contaazul.com/webhook-callme/', post_save, { headers: headers }).then((res) => {
                console.log(`Success send call me to ${phone}`);
            }).catch((err) => {
                console.error(`ERROR send call me to ${phone}: ${err}`);
            })

            return res.send(200, 'Execute');
        } else {
            console.error('inArguments invalid.');
            return res.status(400).end();
        }
    });
};

exports.publish = function (req, res) {
    console.log('publish request');
    // logData(req);
    res.send(200, 'Publish');
};

exports.validate = function (req, res) {
    console.log('validate request');
    // logData(req);
    return res.send(200, {'success': true});
};

exports.stop = function (req, res) {
    console.log('stop request');
    // logData(req);
    res.send(200, 'Stop');
};