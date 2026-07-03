const config = require("@managers/settings");
const eventNames = require("../eventNames");

let timeAtLastTileCreation = 0;
module.exports = ({ socket, io, data }) => {
	const [userBlocked, newTime] = socket.abuse.isUserBlocked(
		timeAtLastTileCreation,
		"tiles",
		"ioAbuse",
		"Making tiles inhumanly fast! File I/O abuse.",
	);
	timeAtLastTileCreation = newTime;
	if (userBlocked) return;

	const settings = config.settings();
	const { name, interaction } = data;
	settings.profiles[settings.profile].push({
		[name]: { ...interaction },
	});
	config.save();
	io.emit(eventNames.default.reload_tiles, settings.profiles[settings.profile]);
};
