const eventNames = require("./eventNames");
const fdws = require("../managers/fdws");
const debug = require("$/debug");

module.exports = {
	name: "App WS Forwarder",
	id: "fd.handlers.app",
	exec: ({ socket, io, clients }) => {
		fdws._io = io;
		
		socket.on(eventNames.fdws.sendRequest, (data) => {
			if (fdws.connected) {
				fdws.send(data[0], ...data[1]);
			}
		});

		socket.on(eventNames.fdws.state, () => {
			socket.emit(eventNames.fdws.state, fdws.connected);
		});
	},
};
