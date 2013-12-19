var fs = require('fs');
var handlebars = require('handlebars');

var Gallery = function(config) {
  this.config = config || {};
  if (!this.config.cloud) {
    throw Error('Unspecified "cloud" in config');
  }
  var client = require('./clouds/' + this.config.cloud);
  if (!this.config[this.config.cloud]) {
    throw Error('Unspecified "' + this.config.cloud + '" section in config');
  }
  this.client = client(this.config[this.config.cloud]);
  this.listTemplate = handlebars.compile(fs.readFileSync(__dirname + '/templates/index.html').toString());
};

Gallery.prototype.list = function(req, res) {
  var tpl = this.listTemplate;
  return this.client.list(function renderList(err, data) {
    res.setHeader('Content-Type', 'text/html');
    //res.setHeader('Content-Length', body.length);
    if (!err && data) {
      return res.end(tpl({images: data}));
    }
    return res.end(data);
  });
};

Gallery.prototype.image = function(req, res) {
  return this.client.image(req.params.img, res);
};

Gallery.prototype.thumb = function(req, res) {
  return this.client.thumb(req.params.img, res);
};

module.exports = function createGallery(config) {
    return new Gallery(config);
};
