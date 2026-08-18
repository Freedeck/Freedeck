const fs = require("node:fs");
const path = require("node:path");
const picocolors = require("$/picocolors.js");
const openPackage = require("@managers/providers/package");
const loadPlugin = require("./loadPlugin");

module.exports = async ({ debug, file, pl }) => {
	debug.log(
		"Loading unpacked plugin. Disabling/enabling are unavailable.",
		"Plugins / Source Folder",
	);
	const pkg = path.resolve(`./plugins/${file}/package.json`);
	if (!fs.existsSync(pkg)) return;
	const configPackage = require(pkg);
	if (!configPackage.freedeck) return;
	// It's a fdpackage, just source folder.
	debug.log(
		picocolors.yellow(`Initializing Freedeck package ${file}`),
		"Plugins",
	);
	const packagefied = path
		.resolve(`./tmp/_${file.replaceAll("/", "_")}`)
		.replace(".src", ".fdpackage");
	fs.mkdirSync(packagefied, { recursive: true });
	await fs.promises.cp(path.resolve(`./plugins/${file}`), packagefied, {
		recursive: true,
	});
	(async () => {
		await openPackage({
			debug,
			filePath: path.resolve(`./tmp/_${file.replaceAll("/", "_")}`),
			pluginManager: pl,
			overrideExtractionPath: path.resolve(`./plugins/${file}`),
		});
	})();
	return; s
};
