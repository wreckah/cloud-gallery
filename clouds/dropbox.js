var request = require('request');
var debug = require('debug')('cloud-gallery:dropbox');

var DropboxClient = function(options) {
  this.options = options || {};
};

DropboxClient.prototype.API_URL = 'https://api.dropbox.com/1/';
DropboxClient.prototype.API_CONTENT_URL = 'https://api-content.dropbox.com/1/';
DropboxClient.prototype.API_ROOT = 'dropbox';

DropboxClient.prototype._request = function(url, method, callback) {
  var options = {
    url: url,
    json: true,
    headers: {
      'Authorization': 'Bearer ' + this.options.access_token
    }
  };
  debug('Sending %s request to %s', method, url);
  return request[method.toLowerCase()](options, callback);
};

DropboxClient.prototype.list = function(callback) {
  var url = this.API_URL + 'metadata/' + this.API_ROOT +
    (this.options.path || '/');
  var _path = this.options.path;

  return this._request(url, 'GET', function processList(error, resp, body) {
    if (!error && resp.statusCode === 200) {
      for (var res = [], i = 0; i < body.contents.length; i++) {
        if (body.contents[i].thumb_exists) {
          res.push({
            'path': body.contents[i].path.replace(_path, ''),
          });
        }
      }
      return callback(error, res);
    }

    return callback(error, body);
  });
};

DropboxClient.prototype.image = function(img, resp) {
  var url = this.API_CONTENT_URL + 'files/' + this.API_ROOT +
    (this.options.path || '') + '/' + img;
  var _path = this.options.path;
  return this._request(url, 'GET').pipe(resp);
};

DropboxClient.prototype.thumb = function(img, resp) {
  var url = this.API_CONTENT_URL + 'thumbnails/' + this.API_ROOT +
    (this.options.path || '') + '/' + img + '?size=m';
  var _path = this.options.path;
  return this._request(url, 'GET').pipe(resp);
};

module.exports = function createClient(options) {
  return new DropboxClient(options);
};
