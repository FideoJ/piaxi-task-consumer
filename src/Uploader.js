const Filer = require('./services/Filer');
const path = require('path');
const fs = require('fs');
const { fileName: { afterFace, product } } = require('./config');

class Uploader {
  constructor(workspace) {
    this.workspace = workspace;
  }

  async uploadFile(prefix, id, fileName) {
    let filePath = path.join(prefix, id, fileName);
    const local = path.join(this.workspace, filePath);
    if (fileName === afterFace)
      filePath = path.join(prefix, id, product);
    return Filer.upload(filePath, fs.createReadStream(local));
  }

  async uploadAfterFace(works_id) {
    return this.uploadFile('works', works_id, afterFace);
  }

  async uploadAfterDub(works_id) {
    return this.uploadFile('works', works_id, product);
  }
}

exports = module.exports = Uploader;
