const sounds = require('../../../settings/sounds');
const fs = require('fs');
const jsonbeautify = require('json-beautify');

module.exports = {
  event: 'c-delete-key',
  callback: (socket, args) => {
    sounds.Sounds.splice(sounds.Sounds.indexOf({ name: args.name, key: args.key }), 1);
    fs.writeFileSync('./src/settings/sounds.js', `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const SoundOnPress = ${sounds.SoundOnPress};
const soundDir = '../assets/sounds/';
const ScreenSaverActivationTime = ${sounds.ScreenSaverActivationTime};
const Sounds = ${jsonbeautify(sounds.Sounds, null, 4, 80)};
if (typeof module !== 'undefined') module.exports = { SoundOnPress, ScreenSaverActivationTime, soundDir, Sounds };`);
    return 'c-change';
  }
};
