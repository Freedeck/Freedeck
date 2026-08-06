const { ipcMain } = require("electron");
const { spawn } = require("node:child_process");
const path = require("node:path");
const electronAppCompanion = {
	title: "Companion",
	preload: path.resolve("src/app/companion/preload.js"),
	createProperties: {
		width: 420,
		height: 525,
		frame: true,
		autoHideMenuBar: true,
	},
	handlePreLaunch: ({ window }) => {
		const dimensions = {
			splashScreen: [420, 525],
			default: [1400, 850],
			// emu: [1136, 640],
			emu: [570, 370],
		};

		ipcMain.handle("resize-splash", () => _handle(...dimensions.splashScreen));
		ipcMain.handle("resize-emu", () => _handle(...dimensions.emu));
		ipcMain.handle("resize", () => _handle(...dimensions.default));
		ipcMain.handle("overlay", () => {
			spawn(process.argv[0], [path.resolve("./src/app/overlay/launcher.js")]);
		});
		
		let isReadyToClose = false;

		window.on('close', async (event) => {
			if (!isReadyToClose) {
				event.preventDefault(); 
				
				try {
					await window.webContents.executeJavaScript(`
						if(universal && universal.send && universal.events) universal.send(universal.events.default.close)
					`);
				} catch (error) {
					console.error("Failed to execute script before close:", error);
				} finally {
					isReadyToClose = true;
					window.close(); 
				}
			}
		});

		async function _handle(w, h) {
			window.setSize(w, h);
			window.center();
		}
	},
	launch: (window) => {
		window.loadFile(path.resolve("webui/client/new-connect.html"));
	},
};

module.exports = electronAppCompanion;
