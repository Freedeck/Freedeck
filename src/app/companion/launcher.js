const { app, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const { fork } = require("child_process");
const makeWindow = require("../makeWindow");
const launcherObject = require("./window");
const net = require("net");
const os = require("os");
const path = require("node:path");
const { writeFileSync, existsSync } = require("node:fs");

const pipePath = '\\\\.\\pipe\\fd_app_handoff';

const client = net.createConnection({ path: pipePath }, () => {
	if(!existsSync('download.new.freedeck.launcher')) writeFileSync('download.new.freedeck.launcher', 0)
  dialog.showErrorBox("Old Launcher Detected!", `Freedeck has automatically detected that you are still using the outdated "App" (launcher/updater).

Freedeck has completely consolidated into one app, removing the requirement of pressing Launch every time you open the app.

Please download the latest version on GitHub (repository: freedeck/freedeck), or Freedeck.app!

Freedeck will automagically move your data over for you, when you make the switch.

This configuration has been marked for update.

Thank you for using Freedeck.`)
  client.end();
});
client.on('error', (err) => {  })
app.on("ready", () => {
	makeWindow(launcherObject);

	const isDev = !app.isPackaged;

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

	autoUpdater.checkForUpdatesAndNotify();
});
