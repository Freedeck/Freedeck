const path = require('path');
const debug = require('../util/debug');
const fs = require('fs');
const rob = require('robotjs');
const sbc = require('../settings/sounds');

const init = (io, app) => {
  const loginList = [];
  const sessions = [];
  const events = new Map();

  debug.log('Adding events to API');

  fs.readdirSync(path.join(__dirname, '/events')).forEach(function (file) {
    fs.readdirSync(path.join(__dirname, '/events/' + file)).forEach(cEvent => {
      const query = require(path.join(__dirname, '/events/' + file + '/' + cEvent));
      events.set(query.event, { callback: query.callback, event: query.event });
      debug.log('Added ' + file + ' event ' + query.event + ' from file ' + cEvent);
    });
  });

  io.on('connection', function (socket) {
    // Initial connection
    console.log('Connected to client @ ' + new Date());
    setTimeout(function () {
      socket.emit('server_connected'); // Send user confirmation: connected to server
      socket.emit('set-theme', fs.readFileSync(path.join(__dirname, '/persistent/theme.sd')).toString()); // Tell client to set the theme
      debug.log('Sent user connection success message');
    }, 150);

    socket.on('keypress', function (keyInput) {
      debug.log(JSON.stringify(keyInput));
      if (keyInput.name) {
        sbc.Sounds.forEach(sound => {
          if (sound.name === keyInput.name) {
            io.emit('press-sound', sbc.soundDir + sound.path, sound.name);
          }
        });
        return;
      }
      let keys = [];
      if (keyInput.key !== undefined) keys.push(keyInput.key);
      if (keyInput.keys) keys = JSON.parse(keyInput.keys);
      keys.forEach(function (key) {
        key = key.split('}')[0];
        rob.keyToggle(key, 'down');
        setTimeout(function () {
          rob.keyToggle(key, 'up');
        }, 50);
      });
    });
    socket.on('Authenticated', function (sessionID) {
      debug.log('Recieved ' + sessionID, ', checking against session list..');
      if (sessions.includes(sessionID)) {
        debug.log(sessionID + ' is valid!');
        socket.emit('session_valid');
      } else {
        debug.log(sessionID + ' is invalid, kicking out user..');
        socket.emit('session_invalid');
      }
    });
    events.forEach(function (event) {
      socket.on(event.event, async function (args) {
        debug.log(event.event + ' ran');
        if (event.async) {
          await event.callback(socket, args, loginList);
        } else {
          const callback = event.callback(socket, args, loginList);
          if (!callback || typeof callback !== 'string') { return; }
          if (callback.startsWith('ValidateSession:')) {
            const person = callback.split(':')[1];
            sessions.push(person);
          }
          if (callback.startsWith('c-change')) {
            io.emit('c-change');
          }
        }
      });
    });
  });

  // Now HTTP debug methods
  fs.readdir(path.join(__dirname, '/routes'), (err, files) => {
    if (err) { throw new Error(err); }
    files.forEach(routefile => {
      const route = require(path.join(__dirname, '/routes/' + routefile));
      // type, route, exec
      // only get supported for now
      if (route.type === 'get') {
        app.get('/api/' + route.route, (req, res) => route.exec(req, res));
      }
    });
  });
};

module.exports = { init };
