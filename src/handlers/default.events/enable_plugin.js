const path = require("node:path");
const plugins = require("@managers/plugins");
const eventNames = require("../eventNames");
const fs = require("node:fs");

module.exports = ({ io, data }) => {
	if (!fs.existsSync(path.resolve(`./plugins/${data}`))) return;
	fs.renameSync(
		path.resolve(`./plugins/${data}`),
		path.resolve(`./plugins/${data.split(".disabled")[0]}`),
	);
	plugins._disabled = plugins._disabled.filter((x) => x !== data);
	plugins.load(data.split(".disabled")[0]);
	io.emit(eventNames.default.reload);
};
