const Promise = require('bluebird');
const cp = Promise.promisifyAll(require('child_process'));
const path = require('path');
const Downloader = require('./Downloader');
const Uploader = require('./Uploader');
const {
  fileName: { afterFace, product },
  algorithm: { faceReplace, dub },
} = require('./config');

class Executer {
  constructor(workspace) {
    this.workspace = workspace;
    this.downloader = new Downloader(workspace);
    this.uploader = new Uploader(workspace);
  }

  async execTask(task) {
    const { type } = task;
    switch (type) {
      case 'face':
        return this.execFaceTask(task);
      case 'dub':
        return this.execDubTask(task);
      default:
        return Promise.reject(new Error('Not implemented'));
    }
  }

  async execFaceTask(faceTask) {
    const { video_id, works_id, extra: { role_id } } = faceTask;
    const [video, userFace, role] = await Promise.all([
      this.downloader.downloadVideo(video_id),
      this.downloader.downloadUserFace(works_id),
      this.downloader.downloadRole(role_id),
    ]);
    const output = path.join(this.workspace, 'works', `${works_id}`, afterFace);
    const faceWorkDir = path.join(this.workspace, 'works', `${works_id}`);
    if (video && userFace && role) {
      await cp.execAsync(`${faceReplace} ${video} ${userFace} ${role} ${output} ${faceWorkDir}`);
      await this.uploader.uploadAfterFace(works_id);
    }
  }

  async execDubTask(dubTask) {
    const { video_id, works_id, extra: { bgm_id } } = dubTask;
    const [voice, bgm, video, subtitle] = await Promise.all([
      this.downloader.downloadVoice(works_id),
      this.downloader.downloadBgm(bgm_id),
      this.downloader.downloadAfterFaceOrVideo(works_id, video_id),
      this.downloader.downloadSubtitle(works_id),
    ]);
    const output = path.join(this.workspace, 'works', `${works_id}`, product);
    const dubWorkDir = path.join(this.workspace, 'works', `${works_id}`);
    if (voice && bgm && video && subtitle) {
      await cp.execAsync(`${dub} ${voice} ${bgm} ${video} ${subtitle} ${output} ${dubWorkDir}`);
      await this.uploader.uploadAfterDub(works_id);
    }
  }
}

exports = module.exports = Executer;
