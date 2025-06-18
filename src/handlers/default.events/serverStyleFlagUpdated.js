const eventNames = require("../eventNames");
const styleManager = require("../../managers/style");

module.exports = ({ io, data }) => {
	for (const key in data) {
		styleManager._cache[key] = data[key];
	}
	styleManager.save();
	io.emit(eventNames.default.serverStyleFlagUpdated, data);
};
