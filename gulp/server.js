'use strict';

var gulp = require('gulp');

var browserSync = require('browser-sync');
var url = require('url');
var proxy = require('proxy-middleware');

// Use proxy-middleware instead of http-proxy because http-proxy was causing
// an issue with the dreamhost server and I couldn't figure it out :/
// Probably something with specific headers. proxy-middleware just works though.
var proxyOptions = url.parse('https://worldrecordsjournal.org/');
proxyOptions.route = '/wp';

function browserSyncInit(baseDir, files, browser) {
  browser = browser === undefined ? 'default' : browser;

  browserSync.instance = browserSync.init(files, {
    startPath: '/index.html',
    port: 8080,
    server: {
      baseDir: baseDir,
      middleware: proxy(proxyOptions)
    },
    browser: browser
  });

}

gulp.task('serve', ['watch'], function () {
  browserSyncInit([
    'app',
    '.tmp'
  ], [
    'app/*.html',
    '.tmp/styles/**/*.css',
    'app/scripts/**/*.js',
    'app/partials/**/*.html',
    'app/images/**/*'
  ]);
});


function expressProxyCacheSetup(directory) {
  var express = require('express');
  var httpProxy = require('http-proxy');
  var util = require('util');

  var app = express();
  var apiProxy = httpProxy.createProxyServer();

  // haha
  var cache = {};

  app.get('/wp/*', function(req, res){
    req.url = req.url.replace('/wp', '');
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
    app.use(express.static(__dirname.replace('gulp', directory)));
  } else {
    var appDirectory = __dirname.replace('gulp', 'app');
    app.use(express.static(appDirectory));
    var cssDirectory = __dirname.replace('gulp', '.tmp/styles');
    app.use('/styles', express.static(cssDirectory));
    
    app.use(function(req, res) {
	   	console.log('User-Agent: ' + req.headers['user-agent']);
    	res.sendFile(appDirectory + '/index.html');
  	});
  }
  app.listen(8080);
}

gulp.task('serve:4Real', ['styles'], function() {
  expressProxyCacheSetup();
});

gulp.task('serve:4RealDist', ['build'], function() {
  expressProxyCacheSetup('dist');
});

gulp.task('serve:dist', ['build'], function () {
  browserSyncInit('dist');
});

gulp.task('serve:e2e', function () {
  browserSyncInit(['app', '.tmp'], null, []);
});

gulp.task('serve:e2e-dist', ['watch'], function () {
  browserSyncInit('dist', null, []);
});
