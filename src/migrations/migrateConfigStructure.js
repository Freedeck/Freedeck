const { existsSync, writeFileSync, rmSync } = require("node:fs");
const { paths } = require("../routers/static");
const path = require("node:path");
const { configLocation } = require("../managers/settings");

const oldCfgLoc = path.resolve("./src/configs/config.fd.js");

if (existsSync(oldCfgLoc)) {
	console.log("Migrating your v1 configuration to v2 schema");
	const thatConfig = require(oldCfgLoc);
	const newMainConfig = {
		release: thatConfig.release || "stable",
		theme: thatConfig.theme || "default.css",
		profile: thatConfig.profile || "Default",
		screenSaverActivationTime: thatConfig.screenSaverActivationTime || 5,
		soundOnPress: thatConfig.soundOnPress || false,
		useAuthentication: thatConfig.useAuthentication || false,
		port: thatConfig.port || 5754,
		profiles: thatConfig.profiles,
	};
	console.log("- Set up main.json");

	writeFileSync(configLocation, JSON.stringify(newMainConfig, null, 2));
	rmSync(oldCfgLoc);
	console.log("* Deleted old config.fd.js");
}
