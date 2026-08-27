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

	const { name, interaction } = data;
	const settings = config.settings();
	const keyListing = settings.profiles[settings.profile];

	const snd = keyListing.find(item => 
		Object.values(item)[0]?.uuid === interaction.uuid
	);

	if (snd) {
		const oldKey = Object.keys(snd)[0];
		if (oldKey !== name) delete snd[oldKey];
		snd[name] = interaction;
	}

	config.save();
	io.emit(eventNames.default.reload_tiles, settings.profiles[settings.profile]);
};
