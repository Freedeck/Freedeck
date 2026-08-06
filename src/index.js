const path = require("node:path");

if(process.argv.includes("--is-dev=true")) {
	require('module-alias/register')
} else {
	const moduleAlias = require('module-alias');
	moduleAlias.addAliases({
		"@root": path.resolve("src/.."),
		"@src": path.resolve("src"),
		"@routers": path.resolve("src/routers"),
		"@public": path.resolve("src/public"),
		"@managers": path.resolve("src/managers"),
		"@handlers": path.resolve("src/handlers"),
		"$": path.resolve("src/utils"),
		"@freedeck": path.resolve("src/classes")
	});
}


const { recordTime } = require("$/timer");
recordTime("STARTUP");

const picocolors = require("$/picocolors");
const fs = require("node:fs");

const { configLocation } = require("@managers/settings");

if (!fs.existsSync(configLocation)) {
	console.log(picocolors.bgRed("Settings do not exist yet,running migration."));
	require('@src/migrations/05-createStartingConfiguration');
}

recordTime("context-switch:is-server");
require("./migration");
require("$/console.js");
(async () => require("./server"))();