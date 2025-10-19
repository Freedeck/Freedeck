const timeCache = [];
const fs = require("node:fs");
const dbg = require("./debug");
function recordTime(tag) {
	if (!dbg.status) return;
	console.log("Recording tag", tag);
	timeCache.push({ time: Date.now(), tag });
}

function writeFinal() {
	fs.writeFileSync("user-data/logs/timecache.json", JSON.stringify(timeCache));
}

module.exports = { recordTime, writeFinal };
