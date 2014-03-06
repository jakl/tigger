#!/usr/bin/env node
var httpProxy = require('http-proxy');
var moment = require('moment');
var colors = require('colors');

var options = {
  target : "http://localhost:10612",
};

var proxy = httpProxy.createProxyServer(options).listen(10612);

proxy.on('error', function (err, req, res) {
  console.log(colors.white(moment.utc()._d));
  console.log(colors.red("Proxy Error !!!"));
});

proxy.on('proxyRes', function (res) {
  console.log(colors.white(moment.utc()._d));
  console.log(colors.green(JSON.stringify(res.headers, true, 2)));
  res.on('data', function(chunk) {
    var data = ''
    try { data = JSON.parse(chunk) } catch(e) {data = { warning: 'non-json' }}
    console.log(colors.cyan(JSON.stringify(data, true, 2), true, 2));
  });
});
