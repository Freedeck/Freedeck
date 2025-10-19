const config = require("@managers/settings");
const eventNames = require("../eventNames");

let timeAtLastTileCreation = 0;
module.exports = ({ socket, io, data }) => {
	const [userBlocked, newTime] = socket.abuse.isUserBlocked(
		timeAtLastTileCreation,
		"tiles",
		"ioAbuse",
		"Moving tiles inhumanly fast! File I/O abuse.",
	);
	timeAtLastTileCreation = newTime;
	if (userBlocked) return;

	const item = JSON.parse(data.item);
	if (item === null) return;

	const settings = config.settings();
	const profile = settings.profiles[settings.profile];
	let flag = false;

	for (const sndObj of profile) {
		const snd = sndObj[Object.keys(sndObj)[0]];
		if (snd.uuid === item.uuid) {
			// Update positions if there's already something at the new index
			for (const soundToCheckObject of profile) {
				const soundToUpdate =
					soundToCheckObject[Object.keys(soundToCheckObject)[0]];
				if (soundToUpdate.pos === data.newIndex) {
					soundToUpdate.pos = data.oldIndex;
				}
			}
			snd.pos = data.newIndex;
			flag = true;
			break;
		}
		if (flag) return;
	}

	config.save();
	io.emit(
		eventNames.default.reload_sounds,
		settings.profiles[settings.profile],
	);
};
