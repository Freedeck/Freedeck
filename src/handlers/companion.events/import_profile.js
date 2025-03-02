const config = require("@managers/settings");
const eventNames = require("../eventNames");

let timeAtLastTileCreation = 0;
module.exports = ({ socket, io, data }) => {
	const currentTime = Date.now();
	const timeSinceLastNewTile = currentTime - timeAtLastTileCreation;
	if(timeSinceLastNewTile < socket.abuse.timeout.profiles_import) {
		socket.abuse.increment(socket.abuse.presets.ioAbuse, "Importing profiles inhumanly fast! File I/O abuse.");
		socket.abuse.timeout.profiles_import += socket.abuse.timeout.presets.bad_profiles_import;
		return;
	}
	socket.abuse.timeout.profiles_import = Math.max(5, socket.abuse.timeout.profiles_import + socket.abuse.timeout.presets.good_profiles_import)
	timeAtLastTileCreation = currentTime;
	const settings = config.settings();
	settings.profiles[data.name] = data.data;
	config.save();
	io.emit(eventNames.default.reload);
};
