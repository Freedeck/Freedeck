const fs = require("node:fs");
const path = require("node:path");
const folders = [
	"icons",
	"sounds",
	"hooks",
	"plugin-views",
	"bundles",
	"dash-modules",
	"logs",
	"themes",
	"soundpacks",
	"icon-registry",
];
const debug = require("$/debug");
const picocolors = require("$/picocolors");

debug.log("Checking for plugins", picocolors.blue("Migration / User Data"));
if (!fs.existsSync(path.resolve("plugins")))
	fs.mkdirSync(path.resolve("plugins"));
debug.log("Checking for user-data", picocolors.blue("Migration / User Data"));
if (!fs.existsSync(path.resolve("user-data")))
	fs.mkdirSync(path.resolve("user-data"));
debug.log(
	"Checking for user-data depth",
	picocolors.blue("Migration / User Data"),
);
for (const folder of folders) {
	if (!fs.existsSync(path.resolve(`user-data/${folder}`)))
		fs.mkdirSync(path.resolve(`user-data/${folder}`));
}
