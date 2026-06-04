const ws = require("ws");
const os = require("os");
const { execSync } = require("node:child_process");

const fdws = {
	_socket: null,
	_callbacks: {},
	_io: null,
	connected: false,
	isLauncherOpen: () => {
		try {
			if(os.platform == "win32") {
				const out = execSync('tasklist /FI "IMAGENAME eq Freedeck.exe"');
				const realOut = out.toString().trim().trim();
				return !realOut.includes(
					"INFO: No tasks are running which match the specified criteria.",
				);
			}
			return false;
		} catch (err) {
			return false;
		}
	},
	send: (data, ...args) => {
		if (fdws._socket.readyState === ws.OPEN) {
			fdws._socket.send(JSON.stringify({ Event: data, Data: [...args] }));
		}
	},
	on: (event, callback) => {
		if (!fdws._callbacks[event]) fdws._callbacks[event] = [];
		fdws._callbacks[event].push(callback);
	},
	once: (event, callback) => {
		if (!fdws._callbacks[event]) fdws._callbacks[event] = [];
		const fn = (...args) => {
			callback(...args);
			fdws._callbacks[event] = fdws._callbacks[event].filter((x) => x !== fn);
		};
		fdws._callbacks[event].push(fn);
	},
};

let retryDelay = 1000;

function ioEmit(i, ...d) {
	if(fdws._io && fdws._io.emit) fdws._io.emit(i, ...d)
}

function retryConnection(url = "ws://localhost:5756/") {
	try {
		if (!fdws.isLauncherOpen()) {
			console.log("Freedeck App was not detected.");
			return;
		}
		fdws._socket = new ws(url);
		fdws._socket.onopen = (event) => {
			fdws.connected = true;
			ioEmit("fdws_state", true);
			console.log("Connected to FDWS!");
			retryDelay = 1000;
			fdws._socket.onmessage = (event) => {
				const realData = atob(event.data);
				try {
					const data = JSON.parse(realData);
					if (fdws._io != null) {
						ioEmit(`fdws_${data.Event}`, JSON.parse(data.Data));
					}
				} catch (e) {
					console.log(realData);
					console.log(`Failed to parse JSON: ${e}`);
				}
			};
		};
		fdws._socket.onclose = (event) => {
			ioEmit("fdws_state", false);
			fdws.connected = false;
			setTimeout(() => {
				if (fdws._socket.readyState !== ws.OPEN) {
					retryConnection(url);
				}
			}, retryDelay);
			retryDelay = Math.min(retryDelay * 2, 30000);
		};
		fdws._socket.onerror = (event) => {
			console.error("FDWS loop error:", event);
		};
	} catch (e) {
		console.error("FDWS loop error:", e);
		setTimeout(retryConnection, retryDelay);
		retryDelay = Math.min(retryDelay * 2, 30000);
	}
}

retryConnection();

module.exports = fdws;
