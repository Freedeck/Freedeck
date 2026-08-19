const fs = require("node:fs");
const fsPromises = require("node:fs/promises");
const path = require("node:path");
const debug = require("$/debug");
const styleLocation = path.resolve("./src/configs/style.json");

const defaults = {
	scroll: false,
	animation: false,
	"font-size": "15",
	buttonSize: "6",
	iconCountPerPage: "14",
	longPressTime: "3",
	tileCols: "5",
};

let saveTimeout = null;

const styleManager = {
	_cache: {},
	get: () => {
		if (Object.keys(styleManager._cache).length === 0) {
			styleManager.update();
			debug.log("Style updated.", "Managers / Style");
		}
		return styleManager._cache;
	},
	default: () => {
		if (!fs.existsSync(styleLocation)) {
			const def = JSON.stringify(defaults);
			fs.writeFileSync(styleLocation, def);
			debug.log(
				"Created default style configuration file.",
				"Migration / Default Style",
			);
		}
	},
	update: () => {
		styleManager.default();
		delete require.cache[require.resolve(styleLocation)];
		styleManager._cache = require(styleLocation);
		debug.log("Style recached.", "Managers / Style");
	},
	save: () => {
		if (saveTimeout) clearTimeout(saveTimeout);

		saveTimeout = setTimeout(async () => {
			try {
				const dataToSave =
					styleManager._cache !== null ? styleManager._cache : defaults;
				await fsPromises.writeFile(
					styleLocation,
					JSON.stringify(dataToSave, null, 2),
				);
				debug.log("Saved style configuration to file.", "Managers / Style");
			} catch (error) {
				debug.log(
					`Failed to save config: ${error.message}`,
					"Managers / Style",
				);
			}
		}, 500);
	},
};

module.exports = styleManager;
