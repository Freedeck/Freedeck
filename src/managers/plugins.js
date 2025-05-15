const fs = require("node:fs");
const path = require("node:path");
const debug = require("$/debug");
const picocolors = require("$/picocolors");

const providerPackage = require("@managers/providers/package.js");
const singleFile = require("@managers/providers/singleFile.js");
const sourceFolder = require("@managers/providers/sourceFolder.js");
const asarBundle = require("@managers/providers/default.js");

const tmpLocation = path.resolve("./tmp");
const pluginsLocation = path.resolve("./plugins");

const pl = {
	_plc: new Map(),
	_disabled: [],
	_tyc: new Map(),
	_ch: new Map(),
	_settings: new Map(),
	plugins: () => {
		if (pl._plc.length >= 0) {
			(async () => await pl.update())();
			debug.log("Plugins updated.", "Plugins");
		}
		return pl._plc;
	},
	reload: async () => {
		const plList = pl.plugins();
		for (const plugin of plList) {
			if(plugin.instance?.stop) plugin.instance.stop();
			plList.delete(plugin.id);
		}
		for (const type of pl.types()) {
			if(type.instance?.stop) type.instance.stop();
			pl._tyc.delete(type.id);
		}
		for (const key in require.cache) {
			if (key.startsWith(tmpLocation)) {
				delete require.cache[key];
			}
		}
		await pl.update();
	},
	unload: (id) => {
		const plList = pl.plugins();
		const plugin = plList.get(id);
	
		if(plugin) {
			if(plugin.instance?.stop) plugin.instance.stop();
			plList.delete(id);
		}
		for (const key in require.cache) {
			if (key.startsWith(path.resolve(`./tmp/_e_._plugins_${id}.Freedeck`)) || 
					key.startsWith(path.resolve(`./plugins/${id}`)) || 
					key.startsWith(path.resolve(`./plugins/${id}.disabled`))) {
				delete require.cache[key];
			}
		}
		debug.log(picocolors.green(`Successfully unloaded plugin with ID ${id}`), "Plugins");
	},
	reloadSinglePlugin: async (id) => {
		const file = pl.plugins().get(id).instance.file.filePath;
		pl.unload(id);
		if (fs.existsSync(path.resolve('./plugins', file)))
		await pl.load(file);
		debug.log(picocolors.green(`Successfully reloaded plugin with ID ${id}`), "Plugins");
	},
	update: async () => {
		debug.log("Loading plugins.", "Plugins");
		pl._disabled = [];
		pl._plc.clear();
		pl._tyc.clear();
		const files = fs.readdirSync(pluginsLocation);
		const loadPromises = files
			.filter(
				(file) =>
					file.endsWith(".Freedeck") ||
					file.endsWith(".src") ||
					file.endsWith(".fdr.js") ||
					file.endsWith(".fdpackage") ||
					file.endsWith(".disabled"),
			)
			.map(async (file) => await pl.load(file));
		try {
			await Promise.all(loadPromises);
		} catch (er) {
			console.log(er);
		}
	},
	load: async (file) => {
		if(pl._disabled.includes(file)) {
			pl._disabled = pl._disabled.filter((value) => value !== file);
		}
		if (file.includes(".disabled")) {
			pl._disabled.push(file);
			console.log(
				picocolors.gray(`Plugin ${file} is disabled. Skipping.`),
			)
			return;
		}
		try {
			if (file.endsWith(".fdr.js")) {
				singleFile({
					debug,
					file,
					pl,
				})
			} else if (file.endsWith(".src")) {
				sourceFolder({
					debug,
					file,
					pl,
				})
			} else if (file.endsWith(".fdpackage")) {
				providerPackage({
					debug,
					filePath: file,
					pluginManager: pl
				});
			} else if (file.endsWith(".Freedeck")) {
				asarBundle({
					debug,
					file,
					pl,
				});
			} else {
				console.log(picocolors.red(`Error: Couldn't find a suitable provider for ${file}.`), "Plugins");
			}
		} catch (err) {
			console.log(
				picocolors.red(`Error while trying to load plugin ${file}: ${err}`),
				"Plugins",
			);
		}
	},
	types: () => {
		return pl._tyc;
	},
};

module.exports = pl;
