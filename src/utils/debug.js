const fs = require("node:fs");
const path = require("node:path");
const picocolors = require("./picocolors");
const os = require("node:os");

const dbg = {
	start: performance.now(),
	logPath: path.resolve("./user-data/logs/debug-write.txt"),
	status: process.argv.includes("--debug"),
	mode: "Debug",
	setMode: (k) => {
		dbg.mode = k;
	},
	log: (v, k = "_unset") => {
		let strToBuild = "";
		if (k !== "_unset")
			strToBuild += `[${Math.floor(performance.now() - dbg.start)}ms] ${picocolors.blue(k)} » `;
		strToBuild += `${v}`;
		if (dbg.status) console._log(strToBuild);
		if (process.argv.map((e)=>e.includes("debug")).find((e)=>e==true) != undefined) {
			fs.appendFile(
				dbg.logPath,
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
	if (process.argv.map((e)=>e.includes("debug")).find((e)=>e==true) != undefined) {
		const rebuilt = [];
		try {
			for (const item of e) {
				const cleaned = item.replace(os.homedir(), "(User's homedir)");
				rebuilt.push(cleaned);
			}
		} catch (er) {}
		fs.appendFile(
			dbg.logPath,
			`console.log {${Date.now()}} | ${rebuilt.join(",")}\n`,
			(err) => {
				if (err) console.error(err);
			},
		);
	}
};

module.exports = dbg;
