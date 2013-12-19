var _ = require('lodash');
var fs = require('fs');
var express = require('express');
var gallery = require('./index');

var config = JSON.parse(fs.readFileSync('./config.json'));
var gal = gallery(config);

var app = express();
app.get('/', _.bind(gal.list, gal));

app.param(function(name, fn){
  if (fn instanceof RegExp) {
    return function(req, res, next, val) {
      var captures;
      if (captures = fn.exec(String(val))) {
        req.params[name] = captures;
        next();
      } else {
        next('route');
      }
    };
  }
});

app.param('img', /^.+$/);
app.get('/i/:img', _.bind(gal.image, gal));
app.get('/t/:img', _.bind(gal.thumb, gal));

app.param('auth', /^dropbox$/);
app.get('/auth/:auth', function(req, res) {
  console.log(req.params);
  console.log(req.query);
  //res.send('user ' + req.params.auth);
  //res.setHeader('Location', body.length);
  res.setHeader('Content-Type', 'appliction/jsonn');
  res.end(JSON.stringify(req.params));
});

app.listen(3000);
console.log('Listening on port 3000');
