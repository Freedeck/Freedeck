const path = require("node:path");
const plugins = require("@managers/plugins");
const eventNames = require("../eventNames");
const fs = require("node:fs");

module.exports = ({ io, data }) => {
	if(!data) {
		io.emit(eventNames.default.notif, {sender: "Freedeck", data: "No plugin provided."});
		return;
	}
	const currLoaded = plugins.plugins();
	plugin = currLoaded.get(data)
	if(!plugin) {
		io.emit(eventNames.default.notif, {sender: "Freedeck", data: `Plugin ${data} not found.`});
		return;
	}
	plugin = plugin.instance;
	console.log("RH EEEE", plugin)
	if(!fs.existsSync(path.resolve(`./plugins/${plugin.file.filePath}`))) return;
	if(Object.keys(plugin.types).length > 0) {
		for (const type of plugin.types) {
			plugins._tyc.delete(type);
		}
	}
	console.log(`Attempting to disable ${plugin.file.filePath} (${plugin.name})...`);
	currLoaded.delete(plugin.id);
	fs.renameSync(
		path.resolve(`./plugins/${plugin.file.filePath}`),
		path.resolve(`./plugins/${plugin.file.filePath}.disabled`),
	);
	plugins.unload(plugin.id);
	plugins._disabled.push(`${plugin.file}.disabled`);
	io.emit(eventNames.default.reload);
};
