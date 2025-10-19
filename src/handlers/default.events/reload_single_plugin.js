const eventNames = require("../eventNames");
const plugins = require("@managers/plugins");

module.exports = ({ io, data }) => {
	plugins.reloadSinglePlugin(data);
	io.emit(eventNames.default.reload);
};
