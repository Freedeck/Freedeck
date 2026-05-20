const express = require("express");
const http = require("node:http");

const picocolors = require("$/picocolors");
const { recordTime } = require("$/timer");
const app = express();
const server = http.createServer(app);
const config = require("@managers/settings");
const { compileWebpack } = require("@src/webpack");

/** ROUTERS */
const handoffRouter = require("@routers/handoff");
const connectRouter = require("@routers/connect").router;
const staticRouter = require("@routers/static").router;
const uploadRouter = require("@routers/uploads");
recordTime("http:required-all-routers");

(async () => {
	compileWebpack().catch((err) => console.error(err));
})();

const settings = config.settings();
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

app.get("/native/*path", (req, res) => {
	fetch(`http://localhost:5756/${req.url.split("/").slice(2).join("/")}`)
		.then((res) => res.json())
		.then((a) => {
			res.send(a);
		})
		.catch((err) => {
			res.send({ _msg: "NativeBridge is not running.", error: err });
		});
});
recordTime("http:loaded-all-endpoints");

recordTime("http:listen-begin");
server.listen(PORT, () => {
	const networkAddresses = require("@managers/networkAddresses");
	const netAddresses = networkAddresses();
	for (const netInterface of Object.keys(netAddresses)) {
		const ipPort = `${netAddresses[netInterface][0]}:${PORT}`;
		console.log(
			picocolors.bgBlue(
				`Go to ${ipPort} on your mobile device (${netInterface})`,
			),
		);
	}
	recordTime("http:listen-complete");
});
