const evt = require("../eventNames");

module.exports = ({ io, socket, data }) => {
	socket.on("disconnect", () => {
		console.log(socket.id, "disconnected")
		const index = io.rpcClients.map((e) => e.id===socket.id);
		if (index !== -1) {
			io.rpcClients.splice(index, 1);
		}
	});
	io.emit(evt.default.notif, {
		sender: "handoff-api",
		data: "Authorize",
		incoming: data,
	});
};
