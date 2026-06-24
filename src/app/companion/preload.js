const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("splashScreen", {
	splash: () => ipcRenderer.invoke("resize-splash"),
	unsplash: () => ipcRenderer.invoke("resize"),
	mobileEmu: () => ipcRenderer.invoke("resize-emu"),
});

contextBridge.exposeInMainWorld("freedeckexperimental", {
	overlay: () => ipcRenderer.invoke("overlay"),
});
