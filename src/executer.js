const Promise = require('bluebird');
const cp = Promise.promisifyAll(require('child_process'));
const path = require('path');

class Executer {
  constructor(workspace) {
    this.workspace = workspace;
  }

  async execDubTask(voice, bgm, silent, subtitle, output) {
    const middle0 = path.join(this.workspace, 'middle0.mp3');
    if (voice && bgm) {
      await cp.execAsync(`ffmpeg -i ${voice} -i ${bgm} -filter_complex amix=input=2:duration=first:dropout_transition=3:weights='2 1' ${middle0}`);
    }

    const middle1 = path.join(this.workspace, 'middle1.mkv');
    if (silent && middle1) {
      await cp.execAsync(`ffmpeg -i ${silent} -i ${middle0} -vcodec copy -acodec copy ${middle1}`);
    }

    if (middle1 && subtitle) {
      await cp.execAsync(`ffmpeg -i ${middle1} -vf subtitles=${subtitle} ${output}`);
    }
  }

  // async execFaceTask(original, user_face, actor) {
  //   if (original && user_face && actor) {
  //     await cp.execAsync(`python main.py ${original} ${user_face} ${actor}`);
  //   }
  // }

  async execFakeTask(original, user_face, actor) {
    if (original && user_face && actor) {
      await cp.execAsync(`bash /tmp/fakeTask.sh ${original} ${user_face} ${actor} ${this.workspace}`);
    }
  }
}

exports = module.exports = Executer;
