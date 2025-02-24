const config = require("@managers/settings");
const eventNames = require("../eventNames");

module.exports = ({ io, data }) => {
	const deletingItem = JSON.parse(data.item);
	const settings = config.settings();
	const currentProfile = settings.profiles[settings.profile];
	settings.profiles[settings.profile] = currentProfile.filter((snd) => {
		const key = Object.keys(snd)[0];
		return snd[key].uuid !== deletingItem.uuid;
	});

	config.internalSavers.asyncSaveSpecificProfile(settings.profiles, settings.profile);
	io.emit(eventNames.default.reload_sounds, settings.profiles[settings.profile]);
};
 