const socketIO = require("socket.io");
const path = require("node:path");
const fs = require("node:fs");
const picocolors = require("$/picocolors");
const debug = require("$/debug");

const NotificationManager = require("@managers/notifications");
const pluginManager = require("@managers/plugins");
const eventNames = require("@handlers/eventNames");

const { server } = require("./http");
const io = new socketIO.Server(server);

const handlers = [];
const plugins = pluginManager.plugins();

const handlerDirectory = path.resolve("./src/handlers");
const handlerListing = fs.readdirSync(handlerDirectory);

(async()=>{
  for (const file of handlerListing) {
    if (fs.lstatSync(path.resolve(handlerDirectory, `${file}`)).isDirectory()) {
      continue;
    }
    const handler = require(`@handlers/${file}`);
    if (!handler.exec) continue;
    handlers.push(handler);
    debug.log(`Loaded socket handler ${handler.name}`, "Server / Initializing")
  }
  await pluginManager.update();

  // startRelay(handleSock);
})();

const types = pluginManager.types;

const clients = [];

debug.log("Initializing server...", "Server / HTTP");

io.on("connection", handleSock);

async function handleSock(socket) {
  /**
   * Send latest notification to Freedeck Client.
   * @param {Object} notification Notification data for Freedeck Client to parse.
   */
  async function sendNotification(notification) {
    if (notification.sender === "handoff-api") {
      if (notification.data.startsWith("hid.s ")) {
        const requestId = notification.data.split("hid.s ")[1].split(" |")[0];
        const requestData = JSON.parse(notification.data.split(`hid.s ${requestId} |`)[1]);
        switch(requestId) {
          case 'slider': {
            const slider = requestData.uuid;
            const value = requestData.value;
            io.emit(eventNames.default.slider_update, { slider, value });
            break;
          }
          case "reload-plugins": {
            io.emit(eventNames.default.reload);
            break;
          }
          case 'notify': {
            socket.emit(eventNames.default.notif, requestData);
          }
        }
      }
      return;
    }
    socket.emit(eventNames.default.notif, notification);
    NotificationManager.once("newNotification", sendNotification);
  }
  socket.abuse = {
    count: 0,
    limit: 100,
    timeout: {
      presets: {
        good_tiles: -1.75,
        bad_tiles: 2,

        good_profiles: -1,
        bad_profiles: 1,

        good_profiles_import: -1,
        bad_profiles_import: 5,
      },
      tiles: 5,
      profiles: 5,
      profiles_import: 5,
    },
    presets: {
      ioAbuse: 2.5,
      generic: 1
    },
    notifyCount:5,
    currentNotifyCount:0,
    kick: (m="Socket API abuse detected!") => {
      socket.sendNotif({
        sender: "Slow down!",
        data: `${m}\nYou have been kicked from the server.`
      })
      socket.disconnect();
    },
    increment(x=1, m="Socket API abuse detected!") {
      socket.abuse.count += x;
      if(socket.abuse.currentNotifyCount++ === socket.abuse.notifyCount) {
        socket.sendNotif({
          sender: "Slow down!",
          data: `${m}\nYou may be kicked from the server soon.`
        })
        socket.abuse.currentNotifyCount = 0;
      }
      if(socket.abuse.count > socket.abuse.limit) {
        socket.abuse.kick(m)
      }
    }
  }

  socket.sendNotif = sendNotification;

  NotificationManager.once("newNotification", sendNotification);

  socket.onAny((event, ...args) => {
    if (event !== eventNames.nbws.sendRequest)
    debug.log(
      `Received event ${event}`,
      `Socket Server / S<-${socket.user ? socket.user : socket.id}`,
    );
  });
  socket.onAnyOutgoing((event, args) => {
    if (event !== eventNames.nbws.sendRequest &&
        event !== eventNames.nbws.reply &&
        !new String(event).startsWith("NBWS_") &&
        event !== 'I'
    ) {
      debug.log(
        `Emitted event ${event}`,
        `Socket Server / S->${socket.user ? socket.user : socket.id}`,
      );
    }

    if(event === "I") debug.log("Emitted event I with server data", `Socket Server / S->${socket.user ? socket.user : socket.id}`);
  });

  clients.push(socket);

  socket.on("disconnect", () => {
    const index = clients.indexOf(socket);
    if (index !== -1) {
      clients.splice(index, 1);
      NotificationManager.removeListener("newNotification", sendNotification);
    }
  });

  try {
    for (const handler of handlers) {
      try {
        if(io.rpcClients?.includes(socket) && handler.name !== "RPC") continue;
        handler.exec({ socket, types, plugins, io, clients });
      } catch (e) {
        debug.log(picocolors.red(e));
      }
      debug.log(
        `${picocolors.cyan(`Added new handler ${handler.name} (${handler.id})`)} for ${socket.user ? socket.user : socket.id}`,
        "Socket Server",
      );
    }
  } catch (e) {
    debug.log(picocolors.red(e));
  }
}