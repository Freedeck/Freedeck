let lock = null;
const {
	app,
	BrowserWindow,
	ipcMain,
	screen,
	globalShortcut,
	Tray,
	Menu,
} = require("electron");
const path = require("node:path");
let tray = null;
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
		focusable: false,
	});

	tray = new Tray(path.resolve("webui/client/assets/overlay.png"));
	const contextMenu = Menu.buildFromTemplate([
		{ label: "Freedeck Overlay" },
		{
			label: "Layout Editor",
			click: () => {
				lock.focus();
				lock.webContents.send("shortcutpressed");
			},
		},
		{
			label: "Reload",
			click: () => {
				lock.webContents.reload();
			},
		},
		{
			label: "DevTools",
			click: () => {
				lock.focus();
				lock.webContents.openDevTools({mode:'detach'});
			},
		},
		{
			label: "Quit",
			click: () => {
				app.isQuiting = true;
				app.quit();
			},
		},
	]);
	tray.setContextMenu(contextMenu);

	const registered = globalShortcut.register("Alt+Shift+Backspace", () => {
		lock.focus();
		lock.webContents.send("shortcutpressed");
	});

	 globalShortcut.register('Alt+VolumeUp', () => {
    // You will need a Node.js library to execute OS-level audio commands
		lock.webContents.send("volup");
  });

  // Volume Down: Ctrl + DownArrow
  globalShortcut.register('Alt+VolumeDown', () => {
    // You will need a Node.js library to execute OS-level audio commands
		lock.webContents.send("voldown");
  });

	globalShortcut.register('Alt+VolumeMute', () => {
    // You will need a Node.js library to execute OS-level audio commands
		lock.webContents.send("volMute");
  });

	lock.on("close", (e) => {
		lock = null;
	});

	lock.setIgnoreMouseEvents(true, { forward: true });
	lock.setAlwaysOnTop(true, "status");
	lock.setPosition(0, 0);

	console.log("Loaded Overlay");

	ipcMain.on("set-ignore-mouse-events", (event, ignore, options) => {
		if (event.sender != lock.webContents) return;
		lock.setIgnoreMouseEvents(ignore, options);
	});

	lock.loadURL("http://localhost:5754/dash");
}

const gotLock = app.requestSingleInstanceLock();

if (!gotLock) {
	app.quit();
	process.exit(0);
}

app.on("ready", () => {
	createOverlay();
});
