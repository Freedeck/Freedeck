const eventNames = require("@handlers/eventNames");
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
const hostname = os.hostname();
function gatherServerInformation(socket) {
	return new Promise((resolve, reject) => {
		debug.log("Fetched plugin information", `Socket Server / ${socket.user}`);
		cfg.update();
		debug.log("Refreshed configuration", `Socket Server / ${socket.user}`);
		const realCfg = cfg.settings();
		const serverInfo = {
			id: socket.id,
			tempLoginID: socket.tempLoginID,
			NotificationManager,
			hostname,
			soundpacks: [
				...readdirSync(commonSoundpacks).filter((e) =>
					e.endsWith(".soundpack"),
				),
				...readdirSync(userSoundpacksLocation)
					.filter((e) => e.endsWith(".soundpack"))
					.map((e) => `${e}#`),
			],
			themes: [
				...readdirSync(commonThemes).filter((e) => e.endsWith(".css")),
				...readdirSync(userThemesLocation)
					.filter((e) => e.endsWith(".css"))
					.map((e) => `${e}#`),
			],
			mobileConnected: tsm.get("isMobileConnected") || false,
			style: styleManager.get(),
			iconRegistry: iconRegistry.map,
			disabled: plugins._disabled,
			events: eventNames,
			launcherOpen: fdws.isLauncherOpen(),
			connectedToFDWS: fdws.connected,
			version: {
				raw: thisPackage.version,
				human: `Freedeck v${thisPackage.version}`,
			},
		};
		if (!socket.auth && realCfg.useAuthentication) {
			delete serverInfo.NotificationManager;
			delete serverInfo.hostname;
			delete serverInfo.config;
			delete serverInfo.launcherOpen;
			delete serverInfo.connectedToFDWS;
			delete serverInfo.iconRegistry;
			serverInfo.needToAuthenticate = true;
		}
		if (socket.auth || !realCfg.useAuthentication) {
			serverInfo.config = realCfg;
			serverInfo.plugins = plugins.sanitizeInfo();
		}
		debug.log("Setup serverInfo. GZipping.", `Socket Server / ${socket.user}`);
		zlib.gzip(JSON.stringify(serverInfo), (err, buffer) => {
			if (err) {
				console.error("Compression error:", err);
				return;
			}
			debug.log(
				"GZipped. Sending information.",
				`Socket Server / ${socket.user}`,
			);

			resolve(buffer);
		});
	});
}

module.exports = {gatherServerInformation};
