const config = require("@managers/settings");
const eventNames = require("../eventNames");

let timeAtLastTileCreation = 0;
module.exports = ({ socket, io, data }) => {
	const [userBlocked, newTime] = socket.abuse.isUserBlocked(
		timeAtLastTileCreation,
		"tiles",
		"ioAbuse",
		"Deleting tiles inhumanly fast! File I/O abuse.",
	);
	timeAtLastTileCreation = newTime;
	if (userBlocked) return;
	const deletingItem = JSON.parse(data);
	const settings = config.settings();
	const currentProfile = settings.profiles[settings.profile];
	settings.profiles[settings.profile] = currentProfile.filter((snd) => {
		const key = Object.keys(snd)[0];
		return snd[key].uuid !== deletingItem.uuid;
	});

	config.save();
	io.emit(eventNames.default.reload_tiles, settings.profiles[settings.profile]);
};
