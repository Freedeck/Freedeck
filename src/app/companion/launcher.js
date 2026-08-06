const { app, dialog } = require("electron");
const { fork } = require('child_process');
const makeWindow = require("../makeWindow");
const launcherObject = require("./window");
const net = require('net');
const os = require('os');
const path = require('node:path');

app.on("ready", () => {
	makeWindow(launcherObject);

    const isDev = !app.isPackaged;

    if(!isDev) {
        const srvRoot = isDev
        ? path.resolve('src/..')
        : path.join(process.resourcesPath, 'app');

        const serverPath = path.resolve(srvRoot, "src/index.js");

        const serverProcess = fork(serverPath, ["--server-only", "--debug", "--is-dev="+isDev], {
            cwd: srvRoot
        });

        app.on("will-quit", () => {
            if (serverProcess) {
                serverProcess.kill();
            }
        });
    }
});