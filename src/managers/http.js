const express = require("express");
const http = require("node:http");

const { recordTime } = require("$/timer");
const debug = require('$/debug');

recordTime("managers/http:loaded");

const config = require("@managers/settings");
const settings = config.settings();
debug.log("Loaded settings.", "Server / HTTP");

const { getStartupMessage } = require("./startupMessage");
const app = express();
const server = http.createServer(app);

const PORT = settings.port || 5754;

let preInitActive = true;
let bonjourInstance = null;

app.get('/api/discover', (req, res, next) => {
  if (!preInitActive) { next(); return; }
  res.send({
    title: 'Freedeck',
    version: 'Loading...',
    plugins: [],
    startupMessage: getStartupMessage(),
    ready: false,
    ip: {},
    myApp: { code: '', host: 'null' }
  });
});

module.exports = {
  http, server, app,
  deactivatePrerun: () => {
    preInitActive = false;
  }
};

recordTime("http:listen-begin");
debug.log("Beginning listen task", "Server / HTTP");

server.listen(PORT, "0.0.0.0", () => {
  debug.log("FD is now listening.", "Server / HTTP");

	recordTime("http:bonjour-start")
  const os = require("node:os");
  const path = require("node:path");
  const picocolors = require("$/picocolors");
  const Bonjour = require("bonjour-service");
  const networkAddresses = require("@managers/networkAddresses");

  const thisPackage = require(path.resolve("package.json"));
  const netAddresses = networkAddresses();
  const localHostName = os.hostname().replace(/\.local\.?$/i, "");

	recordTime("http:bonjour-created")
  bonjourInstance = new Bonjour();
  bonjourInstance.publish({
    name: `Freedeck (${localHostName})`,
    type: "freedeck",
    port: Number(PORT),
    txt: {
      version: String(thisPackage.version),
      hostname: localHostName,
      addresses: JSON.stringify(netAddresses),
    },
  });
	recordTime("http:bonjour-complete")

  console.log(
    picocolors.bgGreen(`Bonjour advertising '_freedeck._tcp' on port ${PORT}`),
  );

  for (const netInterface of Object.keys(netAddresses)) {
    const ipPort = `${netAddresses[netInterface][0]}:${PORT}`;
    console.log(
      picocolors.bgBlue(
        `Go to http://${ipPort} on your mobile device (${netInterface})`,
      ),
    );
  }

  recordTime("http:listen-complete");
});

process.on("SIGINT", () => {
  if (bonjourInstance) {
    bonjourInstance.destroy();
  }
  process.exit(0);
});