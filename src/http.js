const bonjour = require("bonjour-service");
const express = require("express");
const http = require("node:http");
const path = require("node:path");

const picocolors = require("$/picocolors");
const { recordTime } = require("$/timer");
const debug = require('$/debug');

const app = express();
const bonjourInstance = new bonjour();
const server = http.createServer(app);
const config = require("@managers/settings");
const settings = config.settings();
debug.log("Loaded settings.", "Server / HTTP")

/** ROUTERS */
const handoffRouter = require("@routers/handoff");
const connectRouter = require("@routers/connect").router;
const staticRouter = require("@routers/static").router;
const uploadRouter = require("@routers/uploads");
const os = require("node:os");

const pkgLoc = path.resolve("package.json");
const thisPackage = require(pkgLoc);

recordTime("http:required-all-routers");
debug.log("All routers loaded!", "Server / HTTP")

const PORT = settings.port || 5754;

module.exports = {
	http,
	server,
	app,
};

app.use(express.json());

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	next();
});

app.use("/", staticRouter);

app.use("/api", connectRouter);
app.use("/handoff", handoffRouter);

app.use("/api/upload", uploadRouter);

recordTime("http:loaded-all-endpoints");
debug.log("Endpoints created.", "Server / HTTP")

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
