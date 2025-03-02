const config = require("@managers/settings");
const flags = require("../flags");

let timeAtLastTileCreation = 0;
module.exports = {
	exec: ({ socket, data }) => {
		const currentTime = Date.now();
		const timeSinceLastNewTile = currentTime - timeAtLastTileCreation;
		if(timeSinceLastNewTile < socket.abuse.timeout.profiles) {
			socket.abuse.increment(socket.abuse.presets.ioAbuse, "Making profiles inhumanly fast! File I/O abuse.");
			socket.abuse.timeout.profiles += socket.abuse.timeout.presets.bad_profiles;
			return;
		}
		socket.abuse.timeout.profiles = Math.max(5, socket.abuse.timeout.profiles + socket.abuse.timeout.presets.good_profiles)
		timeAtLastTileCreation = currentTime;
		const settings = config.settings();
		settings.profiles[data] = [
			{
				"Back to Home": {
					type: "fd.profile",
					pos: 0,
					uuid: "fdc.0.0",
					data: { profile: "Default" },
				},
			},
		];
		settings.profile = data;
		config.save();
	}
}
