const sounds = require('../../../settings/sounds');
const fs = require('fs');
const Event = require('../Event');

const ev = new Event('c-info-change', (socket, args) => {
  args = JSON.parse(args);
  if (args.type === 'key_edit') {
    const newObject = {};
    try {
      let found;
      if (args.path !== undefined) found = sounds.Sounds.find(thing => thing.path === args.path);
      if (!found) found = sounds.Sounds.find(thing => thing.keys === JSON.stringify(args.ogValues));
      sounds.Sounds.forEach(thing => {
        args.keysArr[0] = args.keysArr[0].toLowerCase();
        args.keysArr[1] = args.keysArr[1].toLowerCase();
        if (thing.keys === JSON.stringify(args.ogValues)) newObject.keys = JSON.stringify(args.keysArr);
        if ('path' in thing && thing.path === args.path && args.path !== '') newObject.path = args.newpath;
        newObject.name = args.newname;
        newObject.icon = thing.icon;
      });
      Object.assign(found, newObject);
    } catch (err) {
      console.log('Error!', err);
    }

    fs.writeFileSync('./src/settings/sounds.js', `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const SoundOnPress = ${sounds.SoundOnPress};
const ScreenSaverActivationTime = ${sounds.ScreenSaverActivationTime};
const soundDir = '../assets/sounds/';
const Sounds = ${JSON.stringify(sounds.Sounds)};
if (typeof module !== 'undefined') module.exports = { SoundOnPress, ScreenSaverActivationTime, soundDir, Sounds };
`);

    return 'c-change';
  } else if (args.type === 'ssat_soc') {
    fs.writeFileSync('./src/settings/sounds.js', `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const SoundOnPress = ${args.soc};
const ScreenSaverActivationTime = ${args.screenSaverActivationTime};
const soundDir = '../assets/sounds/';
const Sounds = ${JSON.stringify(sounds.Sounds)};
if (typeof module !== 'undefined') module.exports = { SoundOnPress, ScreenSaverActivationTime, soundDir, Sounds };
`);
  }
});

module.exports = ev;
