const { app, dialog, Tray, Menu } = require("electron");
const { autoUpdater } = require("electron-updater");
const { fork } = require("child_process");
const makeWindow = require("../makeWindow");
const launcherObject = require("./window");
const path = require("node:path");
autoUpdater.logger = require('electron-log')
autoUpdater.logger.transports.file.level = "debug"
autoUpdater.allowPrerelease = true;
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;
const { version } = require(path.resolve('package.json'))

let tray = null;
let isQuitting = false;
let win = null;

const isLocked = app.requestSingleInstanceLock();

if(!isLocked) {
	app.quit();
	process.exit(0);
}

app.on('second-instance', () => {
	if(win) {
		if(win.isMinimized()) {
			win.restore();
		}
		win.focus();
	}
})

app.on("ready", () => {
	win = makeWindow(launcherObject);

	const isDev = !app.isPackaged;

	if(isDev) {
		autoUpdater.forceDevUpdateConfig = true;
	}

	win.once('ready-to-show', () => {
		autoUpdater.checkForUpdatesAndNotify();
		if(!isDev) {
		}
	})

	if (!isDev) {
		const srvRoot = isDev
			? path.resolve("src/..")
			: path.join(process.resourcesPath, "app");

		const serverPath = path.resolve(srvRoot, "src/index.js");

		const serverProcess = fork(
			serverPath,
			["--server-only", "--debug", "--is-dev=" + isDev],
			{
				cwd: srvRoot,
			},
		);

		app.on("will-quit", () => {
			if (serverProcess) {
				serverProcess.kill();
			}
		});
	}

	win.on('close', (event) => {
		if (!isQuitting) {
			event.preventDefault();
			win.hide();
		}
		return false;
	});

	tray = new Tray(path.resolve('webui/client/assets/logo_big.png'));

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => win.show() },
    { label: 'Quit', click: () => {
      isQuitting = true;
			
			try {
				win.webContents.executeJavaScript(`
					if(universal && universal.send && universal.events) universal.send(universal.events.default.close)
					`);
				} catch (error) {
					console.error("Failed to execute script before close:", error);
				} finally {
					isReadyToClose = true;
					app.quit();
				}
    }}
  ]);

  tray.setToolTip('Freedeck: v' + version);
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    win.show();
  });
});

autoUpdater.on("update-available", (info) => {
  console.log(`[AutoUpdater] Update available: v${info.version}`);
});

autoUpdater.on("update-downloaded", (info) => {
  dialog
    .showMessageBox({
      type: "info",
      title: "Update Ready",
      message: `Freedeck v${info.version} has been downloaded. Restart now to install?`,
      buttons: ["Restart", "Later"],
    })
    .then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
});

autoUpdater.on("error", (err) => {
  dialog
    .showMessageBox({
      type: "error",
      title: "Error while updating",
      message: `${err}`,
      buttons: ["OK"],
    });
});