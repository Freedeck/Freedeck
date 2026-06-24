require("module-alias/register");
const { recordTime } = require("$/timer");
recordTime("STARTUP");

const picocolors = require("$/picocolors");
const fs = require("node:fs");
const path = require("node:path");

const { configLocation } = require("@managers/settings");
const legacyConfigurationLocation = path.resolve("src/configs/config.fd.js");

const runCfg = {
	runs: {
		server: !hasArgument("--companion-only"),
		companion: !hasArgument("--server-only"),
		setup: hasArgument("--setup"),
	},

	requirements: {
		settingsExists:
			fs.existsSync(legacyConfigurationLocation) ||
			fs.existsSync(configLocation),
	},
};

function hasArgument(i) {
	return process.argv.includes(i);
}

const shouldExitNoSettings =
	!runCfg.requirements.settingsExists && runCfg.runs.server;

if (shouldExitNoSettings || runCfg.runs.setup) {
	console.log(picocolors.bgRed("Settings do not exist yet."));
}
recordTime("context-switch:handoff-begin");

if (runCfg.runs.companion === false) {
	console.log(picocolors.blue("Server only mode."));
	recordTime("context-switch:is-server");
	require("./migration");
	require("$/console.js");
	(async () => require("./server"))();
} else if (runCfg.runs.server === false) {
	recordTime("context-switch:is-companion");
	console.log(picocolors.blue("Companion only mode."));
	require("./app/companion/launcher");
}
recordTime("context-switch:handoff-complete");
