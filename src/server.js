const socketIO = require("socket.io");
const path = require("node:path");
const fs = require("node:fs");
const picocolors = require("$/picocolors");
const debug = require("$/debug");

const NotificationManager = require("@managers/notifications");
const pluginManager = require("@managers/plugins");

const eventNames = require("@handlers/eventNames");
const { server } = require("./http");
const { startRelay } = require("./server/relay");
const io = new socketIO.Server(server);

const handlers = new Map();
const plugins = pluginManager.plugins();

(async()=>{
  for (const file of fs.readdirSync(path.resolve("./src/handlers"))) {
    if (fs.lstatSync(path.resolve(`./src/handlers/${file}`)).isDirectory()) {
      continue;
    }
    const handler = require(`@handlers/${file}`);
    if (!handler.exec) continue;
    debug.log(`Loaded socket handler ${handler.name}`, "Server / Initializing")
    handlers.set(handler.name, handler);
  }

  pluginManager.update();

  startRelay(handleSock);
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
    console.log("Sending notification to client");
    socket.emit(eventNames.default.notif, notification);
    NotificationManager.once("newNotification", sendNotification);
  }

  socket.sendNotif = sendNotification;

  NotificationManager.once("newNotification", sendNotification);

  socket.onAny((event, ...args) => {
    if (event !== eventNames.nbws.sendRequest)
    debug.log(
      `Received event ${event} with data ${JSON.stringify(args)}`,
      `Socket Server / ${socket.user ? socket.user : socket.id}`,
    );
  });
  socket.onAnyOutgoing((event, args) => {
    if (event !== eventNames.nbws.sendRequest &&
        event !== eventNames.nbws.reply &&
        !new String(event).startsWith("NBWS_") &&
        event !== 'I'
    ) debug.log(
      `Emitted event ${event} with data ${JSON.stringify(args)}`,
      `Socket Server / ${socket.user ? socket.user : socket.id}`,
    );

    if(event === "I") debug.log("Emitted event I with server data", `Socket Server / ${socket.user ? socket.user : socket.id}`);
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
    for (const handler of handlers.values()) {
      try {
        if(io.rpcClients?.includes(socket) && handler.name !== "RPC") continue;
        handler.exec({ socket, types, plugins, io, clients });
      } catch (e) {
        debug.log(picocolors.red(e));
      }
      debug.log(
        `${picocolors.cyan(`Added new handler ${handler.name}`)} for ${socket.user ? socket.user : socket.id}`,
        "Socket Server",
      );
    }
  } catch (e) {
    debug.log(picocolors.red(e));
  }
}