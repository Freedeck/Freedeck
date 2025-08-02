const eventNames = require("../eventNames");

let timeAtLastTileCreation = 0;
module.exports = ({ socket, io, data }) => {
	const [userBlocked, newTime] = socket.abuse.isUserBlocked(timeAtLastTileCreation, "tiles", "ioAbuse", "Setting tile icons inhumanly fast! File I/O abuse.");
	timeAtLastTileCreation = newTime;
	if(userBlocked) return;

	io.emit(eventNames.companion.set_tile_icon, data);
};
