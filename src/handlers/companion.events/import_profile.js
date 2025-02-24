const config = require("@managers/settings");
const eventNames = require("../eventNames");

module.exports = ({ io, data }) => {
	const settings = config.settings();
	settings.profiles[data.name] = data.data;
	settings.profile = data.name;
	config.save();
	io.emit(eventNames.default.reload);
};
