const config = require("@managers/settings");
const eventNames = require("../eventNames");

let timeAtLastTileCreation = 0;
module.exports = ({ socket, io, data }) => {
	const [userBlocked, newTime] = socket.abuse.isUserBlocked(
		timeAtLastTileCreation,
		"profiles_import",
		"ioAbuse",
		"Importing profiles inhumanly fast! File I/O abuse.",
	);
	timeAtLastTileCreation = newTime;
	if (userBlocked) return;

	const settings = config.settings();
	settings.profiles[data.name] = data.data;
	config.save();
	io.emit(eventNames.default.reload);
};
