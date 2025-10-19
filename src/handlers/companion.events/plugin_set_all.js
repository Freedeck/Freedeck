const plugins = require("@managers/plugins");
const fs = require("node:fs");
const eventNames = require("../eventNames");
const path = require("node:path");

module.exports = ({ io, data }) => {
	if (!plugins.plugins().has(data.plugin)) return;
	fs.writeFile(
		path.resolve(`./plugins/${data.plugin}/settings.json`),
		JSON.stringify(data.settings),
		() => {
			console.log(`Settings for ${data.plugin} saved`);
		},
	);
	plugins.reloadSinglePlugin(data.plugin);
	io.emit(eventNames.default.reload);
};
