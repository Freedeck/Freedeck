const fs = require("node:fs");
const path = require("node:path");
const debug = require("$/debug");
const distLocation = path.resolve("src/public/dist");
if (fs.existsSync(distLocation)) {
	debug.log("Found old webpack build. Cleaning up...", "Migration");
	fs.rmSync(distLocation, { recursive: true });
}
