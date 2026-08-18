const fs = require("node:fs");
const path = require("node:path");
const picocolors = require("$/picocolors.js");
const loadPlugin = require("./loadPlugin");
const metadataVerification = require("./metadataVerification");

module.exports = ({ debug, file, pl }) => {
	debug.log(
		"You're loading a single file plugin. These are in beta!",
		"Plugins",
	);
	const pathTo = path.resolve(`./plugins/${file}`);
	if (!fs.existsSync(pathTo)) return;
	const ipl = require(pathTo);
	const pkg = ipl.package();
	const { main, name, author, version, freedeck } = pkg;
	if (!metadataVerification(pkg)) return;
	loadPlugin({
		exec: () => new ipl(),
		class: ipl
	}, file, freedeck, {
		'id': name,
		'name': freedeck.title,
		'author': author,
		'version': version,
		'packageType': 'plugin'
	}, pl, null)
};
