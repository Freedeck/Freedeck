const fs = require("node:fs");
const path = require("node:path");
const debug = require("$/debug");

const cfgFolder = path.resolve("./src/configs");

const cfgLoc = path.resolve("./src/configs/main.json");
const styLoc = path.resolve("./src/configs/style.json");
const secLoc = path.resolve("./src/configs/secrets.fd.js");

function exists(filePath) {
	try {
		fs.accessSync(filePath, fs.constants.F_OK);
		return true;
	} catch (error) {
		return false;
	}
}

if(!exists(cfgFolder)) {
	fs.mkdirSync(cfgFolder);
	debug.log("Created configs folder", "Migration / Starting Config")
}

if (!exists(styLoc)) {
	fs.writeFileSync(
		styLoc,
		JSON.stringify({"scroll":false,"app.freedeck.last_changelog_viewed":"-1","font-size":15,"iconCountPerPage":14,"buttonSize":6,"tileCols":5,"longPressTime":3}),
	);
	debug.log("Wrote style.json", "Migration / Starting Config")
}

if (!exists(secLoc)) {
	const pwd =
		"fd.524c0321d302bd63cd4dcb56f0430b16be3cee5119dedc950271e1296944af83586326565db12b0a4caa65d7b83c8c11b738fc11b390a256f22f798fc72f7e1d";
	const fullCompleteSecrets =
		"const crypto = require('crypto');\nmodule.exports = {s:{password: '" +
		pwd +
		"'},hash: (data) => 'fd.' + crypto.createHash('sha512').update(data).digest().toString('hex')};";
	fs.writeFileSync(secLoc, fullCompleteSecrets);
	debug.log("Wrote secrets.fd.js", "Migration / Starting Config")
}
if (!exists(cfgLoc)) {
	fs.writeFileSync(
		cfgLoc,
		JSON.stringify({
			release: "stable",
			theme: "default.css",
			profile: "Default",
			profiles: {
				Default: [
					{
						Welcome: {
							type: "fd.none",
							pos: 0,
							uuid: "fdd.01",
							data: {}
						},
					},
					{
						to: {
							type: "fd.none",
							pos: 1,
							uuid: "fdd.02",
							data: {
								color: "#b80486",
							},
						},
					},
					{
						"Freedeck!": {
							type: "fd.none",
							pos: 2,
							uuid: "fdd.03",
							data: {
								color: "#0585bb",
							},
						},
					},
					{
						"Right click to get started.": {
							type: "fd.none",
							pos: 4,
							uuid: "fdd.04",
							data: {}
						},
					},
				],
			},
			screenSaverActivationTime: "5",
			soundOnPress: false,
			useAuthentication: false,
			port: 5754,
		}),
	);
	debug.log("Wrote main.json", "Migration / Starting Config")
}
