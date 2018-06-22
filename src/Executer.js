const Promise = require('bluebird');
const cp = Promise.promisifyAll(require('child_process'));
const path = require('path');
const Downloader = require('./Downloader');
const Uploader = require('./Uploader');
const {
  fileName: { afterFace, product },
  algorithm: { faceReplace, dub }
} = require('./config');

class Executer {
  constructor(workspace) {
    this.workspace = workspace;
    this.downloader = new Downloader(workspace);
    this.uploader = new Uploader(workspace);
  }

  async execFaceTask(faceTask) {
    const { video_id, works_id, extra: { role_id } } = faceTask;
    const [ video, userFace, role ] = await Promise.all(
      this.downloader.downloadVideo(video_id),
      this.downloader.downloadUserFace(works_id),
      this.downloader.downloadRole(role_id),
    );
    const output = path.join(this.workspace, works_id, afterFace);
    if (video && userFace && role) {
      await cp.execAsync(`${faceReplace} ${video} ${userFace} ${role} ${output}`);
      await this.uploader.uploadAfterFace(works_id);
    }
  }

  async execDubTask(dubTask) {
    const { video_id, works_id, extra: { bgm_id } } = dubTask;
    const [ voice, bgm, video, subtitle ] = await Promise.all(
      this.downloader.downloadVoice(works_id),
      this.downloader.downloadBgm(bgm_id),
      this.downloader.downloadAfterFaceOrVideo(works_id, video_id),
      this.downloader.downloadSubtitle(works_id),
    );
    const output = path.join(this.workspace, works_id, product);
    if (voice && bgm && video && subtitle) {
      await cp.execAsync(`${dub} ${voice} ${bgm} ${video} ${subtitle} ${output}`);
      await this.uploader.uploadAfterDub(works_id);
    }
  }

  async execFakeTask(task) {
    const { video_id, works_id } = task;
    await cp.execAsync(`bash /tmp/fakeTask.sh ${video_id} ${works_id} ${this.workspace}`);
  }
}

exports = module.exports = Executer;
