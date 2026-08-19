const debug = require("$/debug");
const eventNames = require("@handlers/eventNames");

module.exports = {
  name: "Telemetry",
  id: "builtin.telemetry",
  disabled: true,
  exec: ({ socket }) => {
    socket.onAny((event, ...args) => {
      if (event !== eventNames.fdws.sendRequest)
        debug.log(
          `Received event ${event}`,
          `Socket.IO / S<-${socket.user ? socket.user : socket.id}`,
        );
    });
    socket.onAnyOutgoing((event, args) => {
      if (
        event !== eventNames.fdws.sendRequest &&
        event !== eventNames.fdws.reply &&
        !new String(event).startsWith("fdws_") &&
        event !== "I"
      ) {
        debug.log(
          `Emitted event ${event}`,
          `Socket.IO / S->${socket.user ? socket.user : socket.id}`,
        );
      }

      if (event === "I")
        debug.log(
          "Emitted event I with server data",
          `Socket.IO / S->${socket.user ? socket.user : socket.id}`,
        );
    });
  }
}