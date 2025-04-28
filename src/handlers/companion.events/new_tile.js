const config = require("@managers/settings");
const eventNames = require("../eventNames");

let timeAtLastTileCreation = 0;
module.exports = ({ socket, io, data }) => {
	const currentTime = Date.now();
	const timeSinceLastNewTile = currentTime - timeAtLastTileCreation;
	if(timeSinceLastNewTile < socket.abuse.timeout.tiles) {
		socket.abuse.increment(socket.abuse.presets.ioAbuse, "Making tiles inhumanly fast! File I/O abuse.");
		socket.abuse.timeout.tiles += socket.abuse.timeout.presets.bad_tiles;
		return;
	}
	socket.abuse.timeout.tiles = Math.max(5, socket.abuse.timeout.tiles + socket.abuse.timeout.presets.good_tiles)
	timeAtLastTileCreation = currentTime;
	const settings = config.settings();
	const {name, interaction} = data;
	settings.profiles[settings.profile].push({
		[name]: {...interaction}
	});
	config.save();
	io.emit(eventNames.default.reload_sounds, settings.profiles[settings.profile]);
};
