const path = require("node:path");
const fs = require("node:fs");

const { version } = require(path.resolve('package.json'));

if (process.argv.includes("--is-dev=true")) {
	require("module-alias/register");
} else {
	const moduleAlias = require("module-alias");
	moduleAlias.addAliases({
		"@root": path.resolve("src/.."),
		"@src": path.resolve("src"),
		"@routers": path.resolve("src/routers"),
		"@public": path.resolve("src/public"),
		"@managers": path.resolve("src/managers"),
		"@handlers": path.resolve("src/handlers"),
		$: path.resolve("src/utils"),
		"@freedeck": path.resolve("src/classes"),
	});
}
const { configLocation } = require("@managers/settings");

const debug = require("$/debug");
const { recordTime } = require("$/timer");
const picocolors = require("$/picocolors");
const { startConsoleListener } = require("./utils/console");
debug.log("Welcome to Freedeck v" + version+'!\nSee any issues? Don\'t be afraid to make an issue report at https://github.com/Freedeck/freedeck !');

recordTime("STARTUP");

if (!fs.existsSync(configLocation)) {
	console.log(picocolors.bgRed("Settings do not exist yet,running migration."));
	require("@src/migrations/05-createStartingConfiguration");
}
const { startServer } = require("./server");

recordTime("context-switch:is-server");
debug.log(picocolors.yellow("Running migrations..."), picocolors.bgBlue("Freedeck"));
require("./migration");
debug.log(picocolors.yellow("Running server..."), picocolors.bgBlue("Freedeck"));
(async () => await startServer())();
debug.log(picocolors.yellow("Running console..."), picocolors.bgBlue("Freedeck"));
startConsoleListener();