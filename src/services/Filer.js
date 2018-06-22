const request = require('request');
const { filer } = require('../config');
const path = require('path');
const pipeline = require('bluebird').promisify(require('stream').pipeline);

class Filer {
  static async download(filePath, stream) {
    const remote = path.join(filer.url, filePath);
    return pipeline(request(remote)
      .on('response', function onResponse(res) {
        if (res.statusCode > 300)
          this.emit('error', res.statusCode);
      }), stream);
  }

  static async upload(filePath, stream) {
    const remote = path.join(filer.url, filePath);
    return pipeline(stream, request.post(remote));
  }
}

exports = module.exports = Filer;
