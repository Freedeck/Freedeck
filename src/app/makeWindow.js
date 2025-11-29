const path = require("node:path");
const { BrowserWindow, ipcMain, screen, globalShortcut } = require("electron");
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
		createOverlay();
	});

	function _handle(w, h) {
		mainWindow.setSize(w, h);
		mainWindow.center();
	}

	console.log(`Here we go! Launching the requested page ${_page}`);

	if (!isUrl) mainWindow.loadFile(path.resolve(_page));
	else mainWindow.loadURL(_page);

	return mainWindow;
};

let lock = null;

function createOverlay() {
	if (lock != null) return;
	const primaryDisplay = screen.getPrimaryDisplay();
	const { width, height } = primaryDisplay.workAreaSize;
	lock = new BrowserWindow({
		width,
		height,
		frame: false,
		autoHideMenuBar: true,
		transparent: true,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.resolve("src/app/overlay-preload.js"),
		},
	});

	globalShortcut.register("Alt+Shift+Backspace", () => {
		lock.focus();
		lock.webContents.send("shortcutpressed");
	});

	lock.on("close", (e) => {
		lock = null;
	});

	lock.setIgnoreMouseEvents(true, { forward: true });
	lock.setAlwaysOnTop(true, "screen-saver");
	lock.setPosition(0, 0);

	console.log("Loaded Overlay");

	ipcMain.on("set-ignore-mouse-events", (event, ignore, options) => {
		if (event.sender != lock.webContents) return;
		lock.setIgnoreMouseEvents(ignore, options);
	});

	lock.loadURL("http://localhost:5754/overlay");
}
