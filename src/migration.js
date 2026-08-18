const { recordTime } = require("$/timer");

const fs = require("node:fs");
const path = require("node:path");
const debug = require("$/debug");

recordTime("server:migration-begin");
debug.log("Gathering migrations...", "Migration");

for (const file of fs.readdirSync(path.resolve("./src/migrations"))) {
	debug.log(`Running migration ${file}...`, "Migration");
	recordTime(`server:migration-task-begin,${file}`);
	require(path.resolve(`./src/migrations/${file}`));
	recordTime(`server:migration-task-complete,${file}`);
}

debug.log("Migration complete.", "Migration");
recordTime("server:migration-complete");
