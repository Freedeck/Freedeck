const path = require("node:path");
const { BrowserWindow } = require("electron");
module.exports = (launcherOptions) => {
	const window = new BrowserWindow({
		...launcherOptions.createProperties,
		icon: path.resolve("./webui/client/assets/logo_big.ico"),
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: launcherOptions.preload,
		},
	});

	launcherOptions.handlePreLaunch({ window });

	console.log(`Here we go! Launching ${launcherOptions.title}!`);

	launcherOptions.launch(window);

	return window;
};
