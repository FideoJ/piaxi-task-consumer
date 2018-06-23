const path = require('path');

module.exports = {
  root: path.join(__dirname, '..', '..'),
  url: 'http://localhost:8998',
  port: 8998,
  redis: {
    host: 'localhost',
    port: '6379',
    db: 1,
    namespaces: {
      tasks: 'piaxi-tasks',
      lock: 'piaxi-task-lock',
    },
  },
  filer: {
    url: 'https://piaxi-filer.resetbypear.com',
  },
  fileName: {
    original: 'original.mp4',
    silent: 'silent.mp4',
    subtitle: 'subtitle.srt',
    voice: 'voice.mp3',
    userFace: 'userFace.jpg',
    product: 'product.mp4',
    bgm: 'bgm.mp3',
    role: 'role.jpg',
    afterFace: 'afterFace.mp4',
  },
  algorithm: {
    faceReplace: '/bin/faceReplace',
    dub: '/bin/dub',
  },
  workspace: '/tmp',
  pollInterval: 1 * 1000,
};
