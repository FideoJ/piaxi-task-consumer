const { filer } = require('../config');
const { promisify } = require('bluebird');
const pipeline = promisify(require('stream').pipeline);
const urljoin = require('url-join');
const request = require('request');

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
    const options = {
      url: remote,
      formData: {
        file: stream,
      },
    };
    return new Promise((resolve, reject) => {
      request.post(options, (err) => {
        if (err)
          reject(err);
        resolve();
      });
    });
  }
}

exports = module.exports = Filer;
