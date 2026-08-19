const path = require("node:path");
const fs = require("node:fs");
const debug = require("$/debug");
const { recordTime } = require("$/timer");

const handlers = [];

const ioHandlers = {
  loadHandlers: async () => {
    debug.log("Detecting and loading handlers", "Server Base")
    const handlerDirectory = path.resolve("./src/handlers");
    const handlerListing = await fs.promises.readdir(handlerDirectory);
    for (const file of handlerListing) {
      if (
        (
          await fs.promises.lstat(path.resolve(handlerDirectory, `${file}`))
        ).isDirectory()
      ) {
        recordTime(`server:load-socket-handler-skip-folder,${file}`);
        continue;
      }
      recordTime(`server:load-socket-handler-begin,${file}`);
      const handler = require(path.resolve(handlerDirectory, file));
      if (!handler.exec || handler.disabled) continue;
      handlers.push(handler);
      debug.log(`Detected handler ${handler.name}`, "Socket.IO / Initializing");
      recordTime(`server:load-socket-handler-complete,${file}`);
    }
  },
  handlers
}

module.exports = ioHandlers;