const eventNames = require("./eventNames");
const cfg = require("@managers/settings");
const styleManager = require("@managers/style");
const plugins = require("../managers/plugins");
const debug = require("$/debug");
const NotificationManager = require("../managers/notifications");
const tsm = require("../managers/temporarySettings");
const pc = require("$/picocolors");
const path = require("node:path");
const zlib = require("node:zlib");
const { readFileSync, readdirSync, existsSync } = require("node:fs");

const HookRef = require("../classes/HookRef");
const { intents, events } = require("../classes/api");
const fdws = require("../managers/fdws");
const { paths } = require("../routers/static");

const userThemesLocation = paths.userData_themes;
const userSoundpacksLocation = paths.userData_soundpacks;

const commonSoundpacks = paths.webui_common_soundpacks;
const commonThemes = paths.webui_common_themes;

const pkgLoc = path.resolve("package.json");
const thisPackage = require(pkgLoc);
const os = require("node:os");
const iconRegistry = require("../managers/iconRegistry");
const {
	gatherServerInformation,
} = require("@managers/serverInformationGatherer");
const hostname = os.hostname();

module.exports = {
	name: "Main",
	id: "builtin.main",
	exec: ({ socket, io, clients }) => {
		debug.log(
			"Connected to server!",
			`Socket.IO / ${socket.user ? socket.user : socket.id}`,
		);

		socket.on("disconnect", () => {
			if (socket.user === "Main") {
				tsm.set("isMobileConnected", false);
				io.emit(eventNames.user_mobile_conn, false);
			}
			if (socket.user === "Companion") tsm.delete("IC");
			debug.log(
				pc.red("Disconnected"),
				`Socket.IO / ${socket.user ? socket.user : socket.id}`,
			);
		});

		for (const event of Object.keys(eventNames.default)) {
			socket.on(eventNames.default[event], (data) => {
				if (
					!existsSync(path.resolve(`./src/handlers/default.events/${event}.js`))
				) {
					console.log(`Event ${event} is not implemented.`);
					return;
				}
				const eventHandler = require(
					path.resolve(`./src/handlers/default.events/${event}`),
				);
				if (typeof eventHandler !== "function") {
					// its a new event handler
					const flags = eventHandler.flags || [];
					if (flags.includes("AUTH")) {
						if (!socket.auth) return;
						eventHandler.exec({ io, socket, data, clients });
					}
					return;
				}
				// unmigrated
				eventHandler({ io, socket, data, clients });
			});
		}

		for (const plugin of plugins.plugins()) {
			const instance = plugin[1].instance;
			if (instance.v2) {
				if (instance._intent.includes(intents.IO)) {
					instance.io = io;
				}
				if (instance._intent.includes(intents.SOCKET)) {
					instance.socket = socket;
				}
				if (instance._intent.includes(intents.CLIENTS)) {
					instance.clients = clients;
				}
				instance.emit(events.connection, {
					active: true,
					io: instance._intent.includes(intents.IO) ? io : null,
					socket: instance._intent.includes(intents.SOCKET) ? socket : null,
					clients: instance._intent.includes(intents.CLIENTS) ? clients : null,
				});
			} else {
				console.log(
					pc.bgYellow(
						`${instance.name} is an outdated PluginV1 plugin. Please update it or ask the developer to! On Freedeck's full release, this compatibility will be removed.`,
					),
				);
				for (const hook of instance.hooks) {
					if (hook.type === HookRef.types.socket) {
						debug.log(
							`Running hook ${hook.name}`,
							`Socket.IO / ${socket.user ? socket.user : socket.id}`,
						);
						hook.execute(socket, io, instance);
					}
				}
			}
		}

		socket.on(eventNames.client_greet, async (user) => {
			socket.user = user;
			debug.log("Migrating to username.", `Socket.IO / ${socket.user}`);
			if (user === "Main" && socket.auth) {
				debug.log("Mobile device.", `Socket.IO / ${socket.user}`);
				if (tsm.get("isMobileConnected") === undefined)
					tsm.set("isMobileConnected", false);
				io.emit(eventNames.user_mobile_conn, true);
				tsm.set("isMobileConnected", true);
			}
			if (user === "Companion" && socket.auth) {
				debug.log("Not a mobile device.", `Socket.IO / ${socket.user}`);
				if (tsm.get("IC") === undefined) tsm.set("IC", socket.id);
				tsm.set("IC", socket.id);
			}

			console.log(
				`Freedeck ${socket.user} connected to server at ${new Date()}`,
			);
			socket.emit(
				eventNames.information,
				await gatherServerInformation(socket),
			);

			debug.log(
				"Letting user know they're connected.",
				`Socket.IO / ${socket.user}`,
			);
		});
	},
};
