const abuseDefaults = {
  timeout: {
    presets: {
      good_tiles: -1.75,
      bad_tiles: 2,

      good_profiles: -1,
      bad_profiles: 1,

      good_profiles_import: -1,
      bad_profiles_import: 5,

      good_login: -0.9,
      bad_login: 1.4,
    },
    tiles: 5,
    profiles: 5,
    profiles_import: 5,
    login: 5.5,
  },
  presets: {
    ioAbuse: 2.5,
    loginAbuse: 3,
    generic: 1,
  },
  notifyCount: 5
}

module.exports = {
  name: "Abuse",
  id: "builtin.abuse",
  exec: ({ socket }) => {
    socket.abuse = {
      count: 0,
      limit: 100,
      currentNotifyCount: 0,
      ...abuseDefaults,
      kick: (m = "Socket API abuse detected!") => {
        socket.sendNotif({
          sender: "Slow down!",
          data: `${m}\nYou have been kicked from the server.`,
        });
        socket.disconnect();
      },
      increment(x = 1, m = "Socket API abuse detected!") {
        socket.abuse.count += x;
        if (socket.abuse.currentNotifyCount++ === socket.abuse.notifyCount) {
          socket.sendNotif({
            sender: "Slow down!",
            data: `${m}\nYou may be kicked from the server soon.`,
          });
          socket.abuse.currentNotifyCount = 0;
        }
        if (socket.abuse.count > socket.abuse.limit) {
          socket.abuse.kick(m);
        }
      },

      isUserBlocked(timeSinceLast, eventPreset, timeoutPreset, timeoutMessage) {
        const currentTime = performance.now();
        const delta = currentTime - timeSinceLast;
        if (delta < socket.abuse.timeout[eventPreset]) {
          socket.abuse.increment(
            socket.abuse.presets[timeoutPreset],
            timeoutMessage,
          );
          socket.abuse.timeout[eventPreset] +=
            socket.abuse.timeout.presets[`bad_${eventPreset}`];
          return [true, currentTime];
        }
        socket.abuse.timeout[eventPreset] = Math.max(
          5,
          socket.abuse.timeout[eventPreset] +
          socket.abuse.timeout.presets[`good_${eventPreset}`],
        );
        return [false, currentTime];
      },
    };
  }
}