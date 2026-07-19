const { app } = require("electron");
const makeWindow = require("../makeWindow");
const launcherObject = require("./window");
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
}
app.on("ready", () => {
	makeWindow(launcherObject);
});
