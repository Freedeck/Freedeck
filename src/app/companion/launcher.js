const { app } = require("electron");
const makeWindow = require("../makeWindow");
const launcherObject = require("./window");
const net = require('net');
const os = require('os');
app.on("ready", () => {
	makeWindow(launcherObject);
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