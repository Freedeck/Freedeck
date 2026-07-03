const path = require("node:path");
const plugins = require("@managers/plugins");
const eventNames = require("../eventNames");
const fs = require("node:fs");

module.exports = ({ io, socket, data }) => {
	if (!data) {
		io.emit(eventNames.default.notif, {
			sender: "Freedeck",
			data: "No plugin provided.",
		});
		return;
	}
	const currLoaded = plugins.plugins();
	plugin = currLoaded.get(data);
	socket.emit(eventNames.default.disable_plugin, {
		stage: "Got plugin data",
		percent: 0,
	});
	if (!plugin) {
		io.emit(eventNames.default.notif, {
			sender: "Freedeck",
			data: `Plugin ${data} not found.`,
		});
		return;
	}
	plugin = plugin.instance;
	if (!fs.existsSync(path.resolve(`./plugins/${plugin.file.filePath}`))) return;
	if (Object.keys(plugin.types).length > 0) {
		for (const type of plugin.types) {
			plugins.types().delete(type);
			socket.emit(eventNames.default.disable_plugin, {
				stage: "Removed " + type,
				percent: 50,
			});
		}
	}
	socket.emit(eventNames.default.disable_plugin, {
		stage: "Unloading plugin module",
		percent: 70,
	});
	console.log(
		`Attempting to disable ${plugin.file.filePath} (${plugin.name})...`,
	);
	plugins.unload(plugin.id);
	socket.emit(eventNames.default.disable_plugin, {
		stage: "Setting as disabled",
		percent: 80,
	});
	fs.renameSync(
		path.resolve(`./plugins/${plugin.file.filePath}`),
		path.resolve(`./plugins/${plugin.file.filePath}.disabled`),
	);
	plugins._disabled.push(`${plugin.file.filePath}.disabled`);
	socket.emit(eventNames.default.disable_plugin, {
		stage: "Done!",
		percent: 100,
	});
	io.emit(eventNames.default.reload);
};
