const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const router = express.Router();

// User data

const paths = {
	userData: path.resolve("user-data"),
	userData_bundles: path.resolve("user-data/bundles"),
	userData_dashModules: path.resolve("user-data/dash-modules"),
	userData_hooks: path.resolve("user-data/hooks"),
	userData_icons: path.resolve("user-data/icons"),
	userData_iconRegistry: path.resolve("user-data/icon-registry"),
	userData_pluginViews: path.resolve("user-data/plugin-views"),
	userData_soundpacks: path.resolve("user-data/soundpacks"),
	userData_sounds: path.resolve("user-data/sounds"),
	userData_themes: path.resolve("user-data/themes"),

	webui_client: path.resolve("webui/client"),
	webui_companion: path.resolve("webui/companion"),
	webui_dash: path.resolve("webui/dash"),

	webui_common_soundpacks: path.resolve("webui/shared/sounds"),
	webui_common_themes: path.resolve("webui/shared/theming"),

	webui_shared: path.resolve("webui/shared"),
};

const expressRouters = {
	"/app": express.static(paths.userData_bundles),
	"/user-data/icon-registry": express.static(paths.userData_iconRegistry),
	"/user-data/dash-modules": express.static(paths.userData_dashModules),
	"/user-data/hooks": express.static(paths.userData_hooks),
	"/icons": express.static(paths.userData_icons),
	"/user-data/plugin-views": express.static(paths.userData_pluginViews),
	"/user-data/soundpacks": express.static(paths.userData_soundpacks),
	"/sounds": express.static(paths.userData_sounds),
	"/user-data/themes": express.static(paths.userData_themes),

	"/": express.static(paths.webui_client),
	"/dash": express.static(paths.webui_dash),
	"/companion": express.static(paths.webui_companion),
	"/app/shared": express.static(paths.webui_shared),
};

for (const routerName of Object.keys(expressRouters)) {
	const actualRouter = expressRouters[routerName];
	router.use(routerName, actualRouter);
}

router.get("/api/upload/report", (req, res) => {
	const start = Date.now();
	const report = [
		fs.readdirSync(paths.userData_sounds),
		fs.readdirSync(paths.userData_icons),
	];
	res.send({ report, time: Date.now() - start, start });
});

module.exports = { router, paths };
