const config = require("@managers/settings");
const eventNames = require("../eventNames");

let timeAtLastTileCreation = 0;
module.exports = ({ socket, io, data }) => {
	const [userBlocked, newTime] = socket.abuse.isUserBlocked(timeAtLastTileCreation, "tiles", "ioAbuse", "Making tiles inhumanly fast! File I/O abuse.");
	timeAtLastTileCreation = newTime;
	if(userBlocked) return;

	const { name, interaction } = data;
	const settings = config.settings();
	const keyListing = settings.profiles[settings.profile];

	for (const snd of keyListing) {
		const key = Object.keys(snd)[0];
		if (snd[key].uuid === interaction.uuid) {
			if (name !== key) {
				delete snd[key];
			}
			snd[name] = interaction;
			break;
		}
	}

	config.save();
	io.emit(eventNames.default.reload_sounds, settings.profiles[settings.profile]);
};
