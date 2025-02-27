const fs = require("node:fs");
const path = require("node:path");
const picocolors = require("./picocolors");
const os = require("node:os");

const dbg = {
	status: process.argv.includes("--debug"),
	mode: "Debug",
	setMode: (k) => {
		dbg.mode = k;
	},
	writeLogs: false,
	log: (v, k = "_unset") => {
		let strToBuild = "";
		if (k !== "_unset") strToBuild += `${picocolors.blue(k)} >> `;
		strToBuild += `${v}`;
		if (dbg.status)
			console._log(
				strToBuild,
			);
		if (dbg.writeLogs === true) {
			fs.appendFile(
				path.resolve("./FreedeckCore.log"),
				`D{${Date.now()}} ${strToBuild}\n`,
				(err) => {
					if (err) console.error(err);
				},
			);
		}
	},
};

console._log = console.log;
console.log = (...e) => {
	console._log(...e);
	if (dbg.writeLogs === true) {
		const rebuilt = [];
		try {
			for (const item of e) {
				const cleaned = item.replace(os.homedir(), "(User's homedir)");
				rebuilt.push(cleaned);
			}
		} catch (er) {}
		fs.appendFile(
			path.resolve("./FreedeckCore.log"),
			`C{${Date.now()}} ${rebuilt.join(",")}\n`,
			(err) => {
				if (err) console.error(err);
			},
		);
	}
};

module.exports = dbg;
