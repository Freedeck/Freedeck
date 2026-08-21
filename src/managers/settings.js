const fs = require("node:fs");
const path = require("node:path");

const debug = require("$/debug.js");
const fsPromises = require("node:fs/promises");

const configLocation = path.resolve("user-data/config/main.json");

let saveTimeout = null;

const sc = {
	configLocation,
	_cache: {},
	settings: () => {
		if (Object.keys(sc._cache).length === 0) {
			sc.update();
			debug.log("Settings updated.", "Managers / Settings");
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
		debug.log("Settings recached.", "Managers / Settings");
	},
	save: (force = false) => {
		if (force) {
			const thatConfig = sc._cache;

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

			fs.writeFileSync(configLocation, JSON.stringify(newMainConfig, null, 2));
		}

		if (saveTimeout) clearTimeout(saveTimeout);

		saveTimeout = setTimeout(async () => {
			try {
				const thatConfig = sc._cache;

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

				await fsPromises.writeFile(
					configLocation,
					JSON.stringify(newMainConfig, null, 2),
				);
				debug.log("Configuration saved.", "Managers / Settings");
			} catch (error) {
				debug.log(
					`Failed to save config: ${error.message}`,
					"Managers / Settings",
				);
			}
		}, 500);
	},
};

module.exports = sc;
