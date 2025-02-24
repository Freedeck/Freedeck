const config = require("@managers/settings");
const eventNames = require("../eventNames");

module.exports = ({ io, data }) => {
	const settings = config.settings();
	settings.profile = data;
	config.internalSavers.asyncSaveMainConfiguration(settings);
	config.update();
	io.emit(eventNames.companion.set_profile, data);
};
