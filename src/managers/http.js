const bonjour = require("bonjour-service");
const express = require("express");
const path = require("node:path");

const picocolors = require("$/picocolors");
const { recordTime } = require("$/timer");
const debug = require('$/debug');
const os = require("node:os");

const bonjourInstance = new bonjour();
const config = require("@managers/settings");
const settings = config.settings();
debug.log("Loaded settings.", "Server / HTTP")

const http = require("node:http");
const { getStartupMessage } = require("./startupMessage");
const app = express();
const server = http.createServer(app);

const pkgLoc = path.resolve("package.json");
const thisPackage = require(pkgLoc);

const PORT = settings.port || 5754;

let preInitActive = true;

app.get('/api/discover', (req,res, next) => {
  if(!preInitActive) {next();return;}
  res.send({
    title: 'Freedeck',
    version: 'Loading...',
    plugins: [],
    startupMessage: getStartupMessage(),
    ready: false,
    ip: {},
    myApp:{code:'',host:'null'}
  })
})

module.exports = {
  http, server, app, 
  deactivatePrerun: () => {
    preInitActive = false;
  }
}

recordTime("http:listen-begin");
debug.log("Beginning listen task", "Server / HTTP")
server.listen(PORT, "0.0.0.0", () => {
	debug.log("FD is now listening.", "Server / HTTP")
	const networkAddresses = require("@managers/networkAddresses");
	const netAddresses = networkAddresses();
	
	const localHostName = os.hostname().replace(/\.local\.?$/i, "");

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
	bonjourInstance.destroy();
	process.exit(0);
});
