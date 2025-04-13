const path = require("node:path");
const { BrowserWindow, ipcMain } = require("electron");
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
		icon: path.resolve("./assets/logo_big.ico"),
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.resolve("src/app/preload.js")
		}
	});

	const dimensions = {
		splashScreen: [420, 525],
		default: [1400, 850],
		// emu: [1136, 640],
		emu: [570, 370],
	}

	ipcMain.handle("resize-splash", () => _handle(...dimensions.splashScreen));
	ipcMain.handle("resize-emu", () => _handle(...dimensions.emu));
	ipcMain.handle("resize", () => _handle(...dimensions.default));

	const fs = require("node:fs");
ipcMain.handle("tryss", async () => {
	const img = await mainWindow.webContents.capturePage({ x: 0, y: 0 }); // Adjust x, y, width, height as needed
	const png = img.toPNG(); // or toJPEG()
	fs.writeFileSync("Screenshot.png", png); // Save the screenshot to the file system
})

	function _handle(w, h) {
		mainWindow.setSize(w, h);
		mainWindow.center();
	}
	
	console.log(`Here we go! Launching the requested page ${_page}`);
	
	if (!isUrl) mainWindow.loadFile(path.resolve(_page));
	else mainWindow.loadURL(_page);

	return mainWindow;
};
