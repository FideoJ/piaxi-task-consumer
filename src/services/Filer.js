const request = require('request');
const { filer } = require('../config');
const pipeline = require('bluebird').promisify(require('stream').pipeline);
const urljoin = require('url-join');

class Filer {
  static async download(filePath, stream) {
    const remote = urljoin(filer.url, filePath);
    return pipeline(request(remote)
      .on('response', function onResponse(res) {
        if (res.statusCode > 300)
          this.emit('error', res.statusCode);
      }), stream);
  }

  static async upload(filePath, stream) {
    const remote = urljoin(filer.url, filePath);
    return pipeline(stream, request.post(remote));
  }
}

exports = module.exports = Filer;
