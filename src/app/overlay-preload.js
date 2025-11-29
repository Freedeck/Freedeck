const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("freedeckoverlay", {
	setIgnoreEvents: (e) =>
		ipcRenderer.send("set-ignore-mouse-events", e, { forward: e }),
	onShortcut: (e) => {
		ipcRenderer.on("shortcutpressed", e);
	},
});
