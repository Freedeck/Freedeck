const ex = require('express');
const path = require('path');
const fs = require('fs');
const httpLib = require('http');

const app = ex();
const debug = require('./util/debug');
const httpServer = new httpLib.Server(app);
const io = require('socket.io')(httpServer);

const settings = require('../Settings');
const getNetworkInterfaces = require('./util/network');
const sounds = require('./settings/sounds');
const fd = require('../package.json');
const picocolors = require('./util/picocolors');
const sockApiInit = require('./api/init').init;

const port = settings.Port || process.env.PORT || 5754;

try {
  console.clear();
  console.log(picocolors.blue('Freedeck v' + fd.version));
  if (debug.is) debug.log('- Using debug mode');
  debug.log('Version matching');
  // Do config versions match the hosts?
  debug.log('Initializing Socket API');
  sockApiInit(io, app); // Socket API initialize

  debug.log('Initializing HTTP routes');
  app.use('/', ex.static('./src/app')); // Initialize HTTP routes for main web app directory

  app.get('/sounds.js', (req, res) => { res.sendFile(path.join(__dirname, '/settings/sounds.js')); }); // Make sounds.js accessible from apps

  debug.log('Listening for ' + port);
  if (process.argv[2] === '--no-server') {
    console.log('Companion is starting in standalone mode!');
    require('child_process').exec('npx electron src/companion'); // Start Companion on another process
  }
  if (process.argv[2] !== '--no-server') {
    httpServer.listen(port, () => {
      let str = '';
      if (process.argv[2] !== '--headless') str = '- launching Companion';
      console.log(picocolors.blue('Freedeck Web Host started'), picocolors.blue(str));
      if (process.argv[2] !== '--headless') require('child_process').exec('npx electron src/companion'); // Start Companion on another process
      Object.keys(getNetworkInterfaces()).forEach(netInterface => {
        console.log(picocolors.bgBlue('Go to ' + getNetworkInterfaces()[netInterface][0] + ':' + port + ' on your mobile device [Interface ' + netInterface + ']'));
      });
    });
  }

  sounds.Sounds.forEach(sound => {
    if (!sound.uuid) {
      debug.log('Sound ' + sound.name + ' has no UUID, fixing');
      sound.uuid = 'FDA-' + require('crypto').randomBytes(8).toString('hex');
    }
  });
  fs.writeFileSync('./src/settings/sounds.js', `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const ScreenSaverActivationTime = ${sounds.ScreenSaverActivationTime};
const soundDir = '../assets/sounds/';
const Sounds = ${JSON.stringify(sounds.Sounds)};
if (typeof module !== 'undefined') module.exports = { cfg:{v:'${fd.version}'}, ScreenSaverActivationTime, soundDir, Sounds };
`);
  delete require.cache[require.resolve(path.resolve('./src/settings/sounds.js'))];
  debug.log('UUID check finished.');

  const vCheck = {
    // eslint-disable-next-line eqeqeq
    set: settings.fdv == fd.version,
    // eslint-disable-next-line eqeqeq
    snd: sounds.cfg.v == fd.version
  };

  debug.log('Settings v' + settings.fdv, 'Sounds v', sounds.cfg.v, 'Freedeck v' + fd.version);

  if (!vCheck.set || !vCheck.snd) {
    debug.log('Failed ver check, set:', vCheck.set, 'sound:', vCheck.snd);
    console.log(picocolors.red('[IMPORTANT!]\nFreedeck is out of sync with v' + fd.version + '\nAffected configs:'));
    if (!vCheck.set) console.log('- Settings');
    if (!vCheck.snd) console.log('- Sounds');
    console.log(picocolors.red('[IMPORTANT!] These configs will be updated and you will need to start Freedeck again.'));
    // Just reset them all llol
    fs.writeFileSync('./src/settings/sounds.js', `/* eslint-disable quotes, quote-props, indent, no-unused-vars */
const ScreenSaverActivationTime = ${sounds.ScreenSaverActivationTime};
const soundDir = '../assets/sounds/';
const Sounds = ${JSON.stringify(sounds.Sounds)};
if (typeof module !== 'undefined') module.exports = { cfg:{v:'${fd.version}'}, ScreenSaverActivationTime, soundDir, Sounds };
`);
    fs.writeFileSync('./Settings.js', `// Welcome to Freedeck internal settings! Here you can.. set.. settings!
// True for yes, false for no

const Settings = {
\tUseAuthentication: ${settings.UseAuthentication}, // Turn on authentication (every session/restart will require password)
\tPassword: '${settings.Password}', // If you are using authentication, you will log in with this password.
\tLoginMessage: '${settings.LoginMessage}', // This message will show for users when they try to login (below "Login to (your name)'s Freedeck")
\tYourName: '${settings.YourName}', // Shows alongside your login message,
\tPort: ${settings.Port},

\t// Don't touch!!!
\tfdv: '${fd.version}'
}
module.exports = Settings;
`);
    process.exit(0);
  }
} catch (err) {
  console.log(picocolors.red('Presumably fatal error:'), err);
}
