const { app } = require("electron");
const makeWindow = require("../makeWindow");
const launcherObject = require("./window");
app.on("ready", () => {
	makeWindow(launcherObject);
});
