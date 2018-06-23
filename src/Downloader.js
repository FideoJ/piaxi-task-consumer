const Filer = require('./services/Filer');
const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp-bluebird');
const { fileName: { silent, userFace, role, voice, bgm, subtitle, afterFace, product } } = require('./config');

class Downloader {
  constructor(workspace) {
    this.workspace = workspace;
  }

  async downloadFile(prefix, id, fileName) {
    let filePath = path.join(prefix, id, fileName);
    const local = path.join(this.workspace, filePath);
    const localDir = path.join(this.workspace, prefix, id);
    await mkdirp(localDir);
    if (!fs.existsSync(local)) {
      if (fileName === afterFace) {
        filePath = path.join(prefix, id, product);
      }
      await Filer.download(filePath, fs.createWriteStream(local));
    }
    return local;
  }

  async downloadVideo(video_id) {
    return this.downloadFile('videos', video_id, silent);
  }

  async downloadUserFace(works_id) {
    return this.downloadFile('works', works_id, userFace);
  }

  async downloadRole(role_id) {
    return this.downloadFile('roles', role_id, role);
  }

  async downloadVoice(works_id) {
    return this.downloadFile('works', works_id, voice);
  }

  async downloadBgm(bgm_id) {
    return this.downloadFile('bgms', bgm_id, bgm);
  }

  async downloadAfterFaceOrVideo(works_id, video_id) {
    try {
      return await this.downloadFile('works', works_id, afterFace);
    } catch (err) {
      if (err.cause.message !== '404')
        throw err;
    }
    return this.downloadFile('videos', video_id, silent);
  }

  async downloadSubtitle(works_id) {
    return this.downloadFile('works', works_id, subtitle);
  }
}

exports = module.exports = Downloader;
