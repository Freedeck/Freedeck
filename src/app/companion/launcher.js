const { app } = require("electron");
const { autoUpdater } = require("electron-updater");
const { fork } = require("child_process");
const makeWindow = require("../makeWindow");
const launcherObject = require("./window");
const path = require("node:path");

autoUpdater.allowPrerelease = true;
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

app.on("ready", () => {
	const win = makeWindow(launcherObject);

	const isDev = !app.isPackaged;

	if(isDev) {
		autoUpdater.forceDevUpdateConfig = true;
    autoUpdater.updateConfigPath = path.resolve('src/../dev-test.yml');
	}

	win.once('ready-to-show', () => {
		if(!isDev) {
			autoUpdater.checkForUpdatesAndNotify();
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