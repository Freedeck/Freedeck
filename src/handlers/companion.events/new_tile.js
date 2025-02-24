const config = require("@managers/settings");
const eventNames = require("../eventNames");

module.exports = ({ io, data }) => {
	const settings = config.settings();
	settings.profiles[settings.profile].push(data);
	config.internalSavers.asyncSaveSpecificProfile(settings.profiles, settings.profile);
	io.emit(eventNames.default.reload_sounds, settings.profiles[settings.profile]);
};
