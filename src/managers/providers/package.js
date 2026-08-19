const path = require("node:path");
const tar = require("tar");
const picocolors = require("$/picocolors");
const fs = require("node:fs");
const { setStartupMessage } = require("../startupMessage");
const loadPlugin = require("./loadPlugin");
const metadataVerification = require("./metadataVerification");
const loadTheme = require("./loadTheme");

async function openPackage({
	debug,
	filePath,
	pluginManager,
	overrideExtractionPath,
}) {
	const resolved = path.resolve(`./plugins/${filePath}`);
	let pathToEx = path.resolve(`./tmp/_${filePath.replaceAll("/", "_")}`);
	if (!overrideExtractionPath) {
		if (fs.existsSync(pathToEx))
			await fs.promises.rm(pathToEx, { recursive: true, force: true });
		await fs.promises.mkdir(pathToEx, { recursive: true });
		await tar.x({
			file: resolved,
			cwd: pathToEx,
		});
	} else {
		pathToEx = overrideExtractionPath;
	}
	const cfgPath = path.resolve(pathToEx, "package.json");
	const pkg = require(cfgPath);
	const { main, name, author, version, freedeck } = pkg;
	if (!metadataVerification(pkg)) return;
	if (freedeck.package === "plugin") {
		const entryPath = path.resolve(pathToEx, main);
		const entry = require(entryPath);
		loadPlugin(entry, filePath, freedeck, {
			'id': name,
			'name': freedeck.title,
			'author': author,
			'version': version,
			'packageType': 'plugin'
		}, pluginManager, pathToEx)
	} else if (freedeck.package === "theme") {
		loadTheme(filePath, pkg, pluginManager, pathToEx);
	}
	setStartupMessage("Loaded " + freedeck.title + ' (' + pluginManager._pluginCache.size + '/' + pluginManager._toLoad + ')');
}

module.exports = openPackage;
