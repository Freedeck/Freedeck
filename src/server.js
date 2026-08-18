const socketIO = require("socket.io");
const picocolors = require("$/picocolors");
const debug = require("$/debug");
const { recordTime } = require("$/timer");

const pluginManager = require("@managers/plugins");
const { clients } = require("@managers/serverClientelle");
const { handlers, loadHandlers }  = require('@managers/ioHandlers');

debug.log("Setting up HTTP", "Server / Runner")
const { server } = require("./http");

debug.log("Setting up Socket.IO", "Server / Runner")
const io = new socketIO.Server(server);

async function startServer() {
  await loadHandlers();
  pluginManager.update();

  io.on("connection", (socket) => handleSock(socket, pluginManager.types, io));
  debug.log("Server initialized.", "Server / Runner");
}

async function handleSock(socket, types, io) {
	clients.push(socket);

	socket.on("disconnect", () => {
		const index = clients.indexOf(socket);
		if (index !== -1) {
			clients.splice(index, 1);
		}
	});

	try {
		for (const handler of handlers) {
			try {
				if (io.rpcClients?.includes(socket) && handler.name !== "RPC") continue;
				handler.exec({ socket, types, io, clients });
			} catch (e) {
				debug.log(picocolors.red(e));
			}
			debug.log(
				`${picocolors.cyan(`Setup "${handler.name}" (${handler.id})`)} for ${socket.user ? socket.user : socket.id}`,
				"Socket.IO",
			);
			recordTime(`server:load-handler,${handler.name}`);
		}
	} catch (e) {
		debug.log(picocolors.red(e), "Socket.IO / Error");
	}
}

startServer();