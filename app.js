var port = (process.env.PORT || 8080);

var url = require('url');
var proxy = require('proxy-middleware');

// Use proxy-middleware instead of http-proxy because http-proxy was causing
// an issue with the dreamhost server and I couldn't figure it out :/
// Probably something with specific headers. proxy-middleware just works though.
var proxyOptions = url.parse('https://worldrecordsjournal.org/wp/');
proxyOptions.route = '/wp';

var directory = 'dist';
  var express = require('express');
  var httpProxy = require('http-proxy');
  var util = require('util');

  var app = express();
  var apiProxy = httpProxy.createProxyServer();

  // haha
  var cache = {};

  app.get('/wp/*', function(req, res){
    // Try to return cached JSON.
    if (cache[req.url] && cache[req.url].body) {
      console.log('CACHED RESPONSE: ' + req.url);
      var cached = cache[req.url];
      res.set(cached.headers);
      return res.send(cached.body);
    }
    // This is important! Wordpress does not like it when host is passed
    // in the proxy.
    delete req.headers['host'];
    apiProxy.web(req, res, {
      target: 'https://worldrecordsjournal.org/'
    });
  });

  apiProxy.on('error', function (err, req, res) {
    console.log('error!');
    res.end('Proxy failure.');
  });

  apiProxy.on('proxyRes', function (proxyRes, req, res) {
    if (req.url.indexOf('json=') < 0) {
      return;
    }
    console.log('CACHING: ' + req.url);
    var cacheObject = {};
    cacheObject.headers = proxyRes.headers;
    cache[req.url] = cacheObject;
    var chunks = [];
    proxyRes.on('data', function (chunk) {
      chunks.push(chunk);
    });
    proxyRes.on('end', function(chunk) {
      if (chunk) {
        chunks.push(chunk);
      }
      cacheObject.body = Buffer.concat(chunks)
    });
  });

  if (directory) {
    app.use(express.static(__dirname + '/' + directory));
  } else {
    var appDirectory = __dirname.replace('gulp', 'app');
    app.use(express.static(appDirectory));
    var cssDirectory = __dirname.replace('gulp', '.tmp/styles');
    app.use('/styles', express.static(cssDirectory));
  }
  app.listen(port);
