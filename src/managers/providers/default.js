const fs = require("node:fs");
const path = require("node:path");
const AsarBundleRunner = require("asar-bundle-runner");
const picocolors = require("$/picocolors.js");

module.exports = async ({ debug, file, pl }) => {
	const a = await AsarBundleRunner.extract(`./plugins/${file}`, false);
	const instantiated = await AsarBundleRunner.run(a);
	instantiated.id = instantiated.id.toLowerCase();
	instantiated.file = { filePath: file };
	Object.freeze(instantiated.file);
	console.log(
		`${picocolors.blue("Plugins")} >> ${picocolors.yellow(`${instantiated.name} is an ASAR bundle. This format is deprecated and will be removed in a future version.`)}`,
	);
	debug.log(
		picocolors.green(
			`Plugin loaded: ${instantiated.name} (${instantiated.id})`,
		),
		"Plugins / ASAR",
	);
	pl.plugins().set(instantiated.id, { file, instance: instantiated });
	if (instantiated.disabled) {
		pl._disabled.push(file);
	}
	if (
		fs.existsSync(path.resolve(`./plugins/${instantiated.id}/settings.json`))
	) {
		const settings = JSON.parse(
			fs.readFileSync(
				path.resolve(`./plugins/${instantiated.id}/settings.json`),
			),
		);
		pl._settings.set(instantiated.id, settings);
	}
};
