const config = require("@managers/settings");

let timeAtLastTileCreation = 0;
module.exports = {
	exec: ({ socket, data }) => {
		const [userBlocked, newTime] = socket.abuse.isUserBlocked(timeAtLastTileCreation, "profiles", "ioAbuse", "Making profiles inhumanly fast! File I/O abuse.");
		timeAtLastTileCreation = newTime;
		if(userBlocked) return;

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
