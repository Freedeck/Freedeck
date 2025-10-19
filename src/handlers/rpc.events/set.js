const evt = require("../eventNames");

module.exports = ({ io, socket, data }) => {
	if (!io.rpcClients) {
		io.rpcClients = [];
	}
	let exist = false;
	for (const client of io.rpcClients) {
		if (client.data.appInformation.id === data.appInformation.id) {
			socket.emit("RPC.ERR", "This application is already connected");
			socket.disconnect();
			exist = true;
		}
	}
	if (exist) return;
	if (!io.rpcClients.includes(socket)) {
		io.rpcClients.push({ id: socket.id, socket, data });
	}
	socket.on("disconnect", () => {
		console.log(socket.id, "disconnected");
		const index = io.rpcClients.map((e) => e.id === socket.id);
		if (index !== -1) {
			io.rpcClients.splice(index, 1);
		}
	});
	io.emit(evt.default.notif, {
		sender: "RPC",
		data: "Authorize",
		incoming: data,
	});
};
