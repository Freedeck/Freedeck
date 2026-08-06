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
    
});

app.on("web-contents-created", () => {
	if(os.platform() == "win32") {
		const client = net.createConnection('\\\\.\\pipe\\FreedeckDesktopPipe', () => {
        client.write('1\r\n');
        client.end();
    });
    
    client.on('error', (err) => {
        console.error('Pipe connection error:', err);
    });
	}
})