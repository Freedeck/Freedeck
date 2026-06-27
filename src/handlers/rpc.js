const eventNames = require("./eventNames");

module.exports = {
	name: "RPC",
	id: "builtin.rpc",
	exec: ({ socket, io }) => {
		for (const event of Object.keys(eventNames.rpc)) {
			socket.on(eventNames.rpc[event], (data) => {
				require(`./rpc.events/${event}`)({ io, socket, data });
			});
		}
	},
};
