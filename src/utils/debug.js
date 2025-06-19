const fs = require("node:fs");
const path = require("node:path");
const picocolors = require("./picocolors");
const os = require("node:os");

const dbg = {
	logPath: path.resolve("./user-data/logs/debug-write.txt"),
	status: process.argv.includes("--debug"),
	mode: "Debug",
	setMode: (k) => {
		dbg.mode = k;
	},
	writeLogs: false,
	log: (v, k = "_unset") => {
		let strToBuild = "";
		if (k !== "_unset") strToBuild += `[${new Date().toLocaleTimeString()}] ${picocolors.blue(k)} >> `;
		strToBuild += `${v}`;
		if (dbg.status)
			console._log(
				strToBuild,
			);
		if (dbg.writeLogs === true) {
			fs.appendFile(
				logPath,
				`debug.log {${Date.now()}} | ${strToBuild}\n`,
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
			this.logPath,
			`console.log {${Date.now()}} | ${rebuilt.join(",")}\n`,
			(err) => {
				if (err) console.error(err);
			},
		);
	}
};

module.exports = dbg;
