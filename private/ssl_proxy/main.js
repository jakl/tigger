#!/usr/bin/env node
// Generated by CoffeeScript 1.7.1
(function() {
  var colors, fs, httpProxy, moment, options, proxy;

  httpProxy = require('http-proxy');

  fs = require('fs');

  options = {
    target: 'http://localhost:3000',
    ws: true,
    xfwd: true,
    ssl: {
      key: fs.readFileSync('key', 'utf8'),
      cert: fs.readFileSync('cert', 'utf8')
    }
  };

  proxy = httpProxy.createProxyServer(options).listen(443);

  console.log(process.env.VERBOSE);

  if (process.env.VERBOSE) {
    moment = require('moment');
    colors = require('colors');
    proxy.on('error', function(err, req, res) {
      console.log(colors.white(moment.utc()._d));
      return console.log(colors.red('Proxy Error !!!'));
    });
    proxy.on('proxyRes', function(res) {
      console.log(colors.white(moment.utc()._d));
      console.log(colors.green(JSON.stringify(res.headers, true, 2)));
      return res.on('data', function(chunk) {
        var data, e;
        data = '';
        try {
          data = JSON.parse(chunk);
        } catch (_error) {
          e = _error;
          data = {
            warning: 'non-json'
          };
        }
        return console.log(colors.cyan(JSON.stringify(data, true, 2)));
      });
    });
  }

}).call(this);
