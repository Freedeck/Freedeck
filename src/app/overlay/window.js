const {
	app,
	ipcMain,
	screen,
	globalShortcut,
	Tray,
	Menu,
} = require("electron");
const path = require("node:path")
    
const electronAppOverlay = {
  title: "Overlay",
  createProperties: {
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
    focusable: false
  },
  preload: path.resolve("src/app/overlay/preload.js"),
  handlePreLaunch: ({window}) => {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    window.setSize(width, height)

    tray = new Tray(path.resolve("webui/client/assets/overlay.png"));
      const contextMenu = Menu.buildFromTemplate([
        { label: "Freedeck Overlay" },
        {
          label: "Layout Editor",
          click: () => {
            window.focus();
            window.webContents.send("shortcutpressed");
          },
        },
        {
          label: "Reload",
          click: () => {
            window.webContents.reload();
          },
        },
        {
          label: "DevTools",
          click: () => {
            window.focus();
            window.webContents.openDevTools({mode:'detach'});
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

      globalShortcut.register("Alt+Shift+Backspace", () => {
        window.focus();
        window.webContents.send("shortcutpressed");
      });

      globalShortcut.register('Alt+VolumeUp', () => {
        // You will need a Node.js library to execute OS-level audio commands
        window.webContents.send("volup");
      });

      // Volume Down: Ctrl + DownArrow
      globalShortcut.register('Alt+VolumeDown', () => {
        // You will need a Node.js library to execute OS-level audio commands
        window.webContents.send("voldown");
      });

      globalShortcut.register('Alt+VolumeMute', () => {
        // You will need a Node.js library to execute OS-level audio commands
        window.webContents.send("volMute");
      });

      window.on("close", (e) => {
        window = null;
      });

      window.setIgnoreMouseEvents(true, { forward: true });
      window.setAlwaysOnTop(true, "status");
      window.setPosition(0, 0);

      ipcMain.on("set-ignore-mouse-events", (event, ignore, options) => {
        if (event.sender != window.webContents) return;
        window.setIgnoreMouseEvents(ignore, options);
      });
  },
  launch: (window) => {
    window.loadURL("http://localhost:5754/dash")
  }
}

module.exports = electronAppOverlay;