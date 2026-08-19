const fs = require("node:fs");
const path = require("node:path");
const debug = require("$/debug");

if (
	fs.existsSync(path.resolve("src/public/companion")) &&
	fs.existsSync(path.resolve("src/public/companion/dist"))
) {
	debug.log(
		"Found old companion build. Cleaning up...",
		"Migration / Legacy Cleanup",
	);
	fs.rmSync(path.resolve("src/public/companion/dist"), { recursive: true });
}

const distLocation = path.resolve("src/public/dist");
if (fs.existsSync(distLocation)) {
	debug.log(
		"Found old WebUI Webpack build. Cleaning up...",
		"Migration / Legacy Cleanup",
	);
	fs.rmSync(distLocation, { recursive: true });
}
