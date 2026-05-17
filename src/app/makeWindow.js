const path = require("node:path");
const { BrowserWindow, ipcMain } = require("electron");
const { spawn } = require("node:child_process");
module.exports = (
	_page = "webui/client/new-connect.html",
	_showTitlebar = true,
	width = 800,
	height = 600,
	isUrl = false,
) => {
	const mainWindow = new BrowserWindow({
		width,
		height,
		frame: _showTitlebar,
		autoHideMenuBar: true,
		icon: path.resolve("./webui/client/assets/logo_big.ico"),
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.resolve("src/app/preload.js"),
		},
	});

	const dimensions = {
		splashScreen: [420, 525],
		default: [1400, 850],
		// emu: [1136, 640],
		emu: [570, 370],
	};

	ipcMain.handle("resize-splash", () => _handle(...dimensions.splashScreen));
	ipcMain.handle("resize-emu", () => _handle(...dimensions.emu));
	ipcMain.handle("resize", () => _handle(...dimensions.default));
	ipcMain.handle("overlay", () => {
		spawn(process.argv[0], [path.resolve("./src/app/overlay-makeWindow.js")]);
	});

	async function _handle(w, h) {
		mainWindow.setSize(w, h);
		mainWindow.center();
	}

	console.log(`Here we go! Launching the requested page ${_page}`);

	if (!isUrl) mainWindow.loadFile(path.resolve(_page));
	else mainWindow.loadURL(_page);

	return mainWindow;
};
