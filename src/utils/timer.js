const timeCache = [];
const fs = require("node:fs");
function recordTime(tag) {
  timeCache.push({time: Date.now(), tag})
}

function writeFinal() {
  fs.writeFileSync("timecache.json", JSON.stringify(timeCache))
}

module.exports = {recordTime, writeFinal}