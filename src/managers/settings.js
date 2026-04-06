const fs = require("node:fs");
const path = require("node:path");

const debug = require("$/debug.js");

const configLocation = path.resolve("./src/configs/main.json");

const sc = {
	configLocation,
	_cache: {},
	settings: () => {
		if (Object.keys(sc._cache).length === 0) {
			sc.update();
			debug.log("Settings updated.", "Settings Cache");
		}
		return sc._cache;
	},
	update: async () => {
		const raw = fs.readFileSync(configLocation, "utf8");
		try {
			JSON.parse(raw);
		} catch (err) {
			console.error(err);
			throw new Error("Invalid JSON configuration.");
		}
		sc._cache = JSON.parse(raw);
		debug.log("Settings recached.", "Settings Cache");
	},
	save: () => {
		const thatConfig = sc.settings();

		const newMainConfig = {
			release: thatConfig.release || "stable",
			theme: thatConfig.theme || "default.css",
			profile: thatConfig.profile || "Default",
			profiles: thatConfig.profiles || [],
			screenSaverActivationTime: thatConfig.screenSaverActivationTime || 5,
			soundOnPress: thatConfig.soundOnPress || false,
			useAuthentication: thatConfig.useAuthentication || false,
			port: thatConfig.port || 5754,
		};

		const cfgStr = JSON.stringify(newMainConfig, null, 2);

		fs.writeFileSync(configLocation, cfgStr);
		debug.log("Configuration saved.", "Settings Storage");
	},
};

module.exports = sc;
