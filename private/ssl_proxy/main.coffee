#!/usr/bin/env coffee
httpProxy = require 'http-proxy'
fs = require 'fs'

options =
  target : 'http://localhost:3000'
  ws: true
  xfwd: true
  ssl:
    key: fs.readFileSync 'key', 'utf8'
    cert: fs.readFileSync 'cert', 'utf8'

proxy = httpProxy.createProxyServer(options).listen 443

console.log process.env.VERBOSE
if process.env.VERBOSE
  moment = require 'moment'
  colors = require 'colors'
  proxy.on 'error', (err, req, res)->
    console.log colors.white moment.utc()._d
    console.log colors.red 'Proxy Error !!!'

  proxy.on 'proxyRes', (res)->
    console.log colors.white moment.utc()._d
    console.log colors.green JSON.stringify res.headers, true, 2
    res.on 'data', (chunk)->
      data = ''
      try
        data = JSON.parse(chunk)
      catch e
        data = warning: 'non-json'
      console.log colors.cyan JSON.stringify data, true, 2
