const fs = require("node:fs");
const path = require("node:path");
const debug = require("$/debug");
const { recordTime } = require("$/timer");
const picocolors = require("$/picocolors");

const providerPackage = require("@managers/providers/package.js");
const singleFile = require("@managers/providers/singleFile.js");
const sourceFolder = require("@managers/providers/sourceFolder.js");
const asarBundle = require("@managers/providers/default.js");
const { setStartupMessage } = require("./startupMessage");

const tmpLocation = path.resolve("./tmp");
const pluginsLocation = path.resolve("./plugins");

const pl = {
	_pluginCache: new Map(),
	_disabled: [],
	_typeCache: new Map(),
	_ch: new Map(),
	_settings: new Map(),
	sanitizeInfo: () => {
		const sanitizedList = {};
		for (const plugin of pl.plugins()) {
			const {
				name,
				id,
				author,
				version,
				popout,
				dashModules,
				types,
				imports,
				hooks,
				views,
				Settings,
				disabled,
				stopped,
			} = plugin[1].instance;
			sanitizedList[id] = {
				name,
				id,
				author,
				version,
				intents: plugin[1].instance._intent || [],
				packageType: plugin[1].instance.packageType || "plugin",
				Settings,
				popout,
				dashModules,
				types,
				imports,
				hooks,
				views,
				disabled,
				stopped,
			};
		}
		return sanitizedList;
	},
	plugins: () => {
		if (pl._pluginCache.length === 0) {
			pl.update();
			debug.log("Plugins updated.", "Plugins");
		}
		return pl._pluginCache;
	},
	reload: async () => {
		const plList = pl.plugins();
		for (const plugin of plList) {
			if (plugin.instance?.stop) plugin.instance.stop();
			plList.delete(plugin.id);
		}
		for (const type of pl.types()) {
			if (type.instance?.stop) type.instance.stop();
			pl.types().delete(type.id);
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
		if (plugin) {
			if (plugin.instance?.stop) plugin.instance.stop();
			debug.log(picocolors.green(`Stop handler ran for ${id}`), "Plugins");
			plList.delete(id);
		}
		for (const key in require.cache) {
			if (
				key.startsWith(path.resolve(`./tmp/_e_._plugins_${id}.Freedeck`)) ||
				key.startsWith(path.resolve(`./tmp/_${id}.fdpackage`)) ||
				key.startsWith(path.resolve(`./plugins/${id}`)) ||
				key.startsWith(path.resolve(`./plugins/${id}.disabled`))
			) {
				delete require.cache[key];
			}
		}
		debug.log(
			picocolors.green(`Successfully unloaded plugin with ID ${id}`),
			"Plugins",
		);
	},
	reloadSinglePlugin: async (id) => {
		const file = pl.plugins().get(id).instance.file.filePath;
		pl.unload(id);
		if (fs.existsSync(path.resolve("./plugins", file))) await pl.load(file);
		debug.log(
			picocolors.green(`Successfully reloaded plugin with ID ${id}`),
			"Plugins",
		);
	},
	_toLoad: 0,
	_workingOn: "",
	update: async () => {
		recordTime("plugins:update-plugin-manager-begin");
		debug.log("Loading plugins.", "Plugins");
		setStartupMessage("Loading plugins...");
		pl._disabled = [];
		pl._pluginCache.clear();
		pl._typeCache.clear();
		const files = fs.readdirSync(pluginsLocation);
		const loadablePackages = files.filter(
			(file) =>
				file.endsWith(".Freedeck") ||
				file.endsWith(".src") ||
				file.endsWith(".fdr.js") ||
				file.endsWith(".fdpackage") ||
				file.endsWith(".disabled"),
		);
		pl._toLoad = loadablePackages.filter(
			(e) => !e.endsWith(".disabled"),
		).length;
		setStartupMessage("Discovered " + pl._toLoad + " packages");
		const loadPromises = loadablePackages.map(
			(file) => {
				setStartupMessage("Loading" + file +' (' +pl._pluginCache.size  +'/' + pl._toLoad+')');
				pl.load(file)
			},
		);
		try {
			await Promise.all(loadPromises);
		} catch (er) {
			console.log(er);
		}
		recordTime("plugins:update-plugin-manager-complete");
	},
	load: async (file) => {
		recordTime(`plugins:load-plugin-begin,${file}`);
		if (pl._disabled.includes(file)) {
			pl._disabled = pl._disabled.filter((value) => value !== file);
		}
		if (file.includes(".disabled")) {
			pl._disabled.push(file);
			console.log(picocolors.gray(`Plugin ${file} is disabled. Skipping.`));
			return;
		}
		try {
			if (file.endsWith(".fdr.js")) {
				singleFile({
					debug,
					file,
					pl,
				});
			} else if (file.endsWith(".src")) {
				sourceFolder({
					debug,
					file,
					pl,
				});
			} else if (file.endsWith(".fdpackage")) {
				await providerPackage({
					debug,
					filePath: file,
					pluginManager: pl,
				});
			} else if (file.endsWith(".Freedeck")) {
				asarBundle({
					debug,
					file,
					pl,
				});
			} else {
				console.log(
					picocolors.red(
						`Error: Couldn't find a suitable provider for ${file}.`,
					),
					"Plugins",
				);
			}
		} catch (err) {
			console.log(
				picocolors.red(`Error while trying to load plugin ${file}: ${err}`),
				"Plugins",
			);
		}
		recordTime(`plugins:load-plugin-complete,${file}`);
	},
	types: () => {
		return pl._typeCache;
	},
};

module.exports = pl;
