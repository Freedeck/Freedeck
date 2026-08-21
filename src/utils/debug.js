const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const picocolors = require("./picocolors");

const logPath = path.resolve("./user-data/logs/debug-write.txt");
const isDebug = true;
const homeDir = os.homedir();

let logStream = null;
if (isDebug) {
	if(!fs.existsSync(path.dirname(logPath))) {
		fs.mkdirSync(path.dirname(logPath), { recursive: true });
	}
	logStream = fs.createWriteStream(logPath, { flags: "a" });
}

const dbg = {
	start: performance.now(),
	logPath,
	status: isDebug,
	mode: "Debug",
	setMode: (k) => {
		dbg.mode = k;
	},
	log: (v, k = "_unset") => {
		const prefix = k !== "_unset" ? `${picocolors.blue(k)} » ` : "";
		const strToBuild = `${prefix}${v}`;

		if (dbg.status) console._log(strToBuild);
		if (logStream) {
			logStream.write(`debug.log {${Date.now()}} | ${strToBuild}\n`);
		}
	},
};

console._log = console.log;
console.log = (...args) => {
	console._log(...args);

	if (logStream) {
		logStream.write(`console.log {${Date.now()}} | ${args.join(" ")}\n`);
	}
};

module.exports = dbg;
