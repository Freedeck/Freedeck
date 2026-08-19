const fs = require("node:fs");
const path = require("node:path");
const AsarBundleRunner = require("asar-bundle-runner");
const picocolors = require("$/picocolors.js");
const loadPlugin = require("./loadPlugin");
const metadataVerification = require("./metadataVerification");

module.exports = async ({ debug, file, pl }) => {
	const a = await AsarBundleRunner.extract(`./plugins/${file}`, false);
	const pathToEx = `./${AsarBundleRunner._temporaryDir}/${AsarBundleRunner._extrPrefix}${file}`;
	const cfgPath = path.resolve(pathToEx, "package.json");
	const pkg = require(cfgPath);
	const { name, author, version, freedeck } = pkg;
	const entry = AsarBundleRunner.modules.get(a);
	if(!metadataVerification(pkg)) return;
	loadPlugin(entry, file, freedeck, {
		'id': name,
		'name': freedeck.title,
		'author': author,
		'version': version,
		'packageType': 'plugin'
	}, pl, pathToEx);
};
