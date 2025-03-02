const config = require("@managers/settings");
const eventNames = require("../eventNames");

let timeAtLastTileCreation = 0;
module.exports = ({ socket, io, data }) => {
	const currentTime = Date.now();
	const timeSinceLastNewTile = currentTime - timeAtLastTileCreation;
	if(timeSinceLastNewTile < socket.abuse.timeout.tiles) {
		socket.abuse.increment(socket.abuse.presets.ioAbuse, "Deleting tiles inhumanly fast! File I/O abuse.");
		socket.abuse.timeout.tiles += socket.abuse.timeout.presets.bad_tiles;
		return;
	}
	socket.abuse.timeout.tiles = Math.max(5, socket.abuse.timeout.tiles + socket.abuse.timeout.presets.good_tiles)
	timeAtLastTileCreation = currentTime;
	const deletingItem = JSON.parse(data.item);
	const settings = config.settings();
	const currentProfile = settings.profiles[settings.profile];
	settings.profiles[settings.profile] = currentProfile.filter((snd) => {
		const key = Object.keys(snd)[0];
		return snd[key].uuid !== deletingItem.uuid;
	});

	config.save();
	io.emit(eventNames.default.reload_sounds, settings.profiles[settings.profile]);
};
 