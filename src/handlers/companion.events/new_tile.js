const config = require("@managers/settings");
const eventNames = require("../eventNames");

module.exports = ({ io, data }) => {
	const settings = config.settings();
	settings.profiles[settings.profile].push(data);
	config.save();
	io.emit(eventNames.default.reload_sounds, settings.profiles[settings.profile]);
};
