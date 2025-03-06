const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('splashScreen', {
  splash: () => ipcRenderer.invoke("resize-splash"),
  unsplash: () => ipcRenderer.invoke("resize"),
})