const fs = require("node:fs");
const path = require("node:path");
const debug = require("$/debug");

if (
	fs.existsSync(path.resolve("src/public/companion")) &&
	fs.existsSync(path.resolve("src/public/companion/dist"))
) {
	debug.log("Found old companion build. Cleaning up...", "Migration");
	fs.rmSync(path.resolve("src/public/companion/dist"), { recursive: true });
}
