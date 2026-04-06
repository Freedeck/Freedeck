const fs = require("node:fs");
const path = require("node:path");

if (fs.existsSync(path.resolve("./user-data/logs/debug-write.txt"))) {
	fs.writeFileSync(path.resolve("./user-data/logs/debug-write.txt"), "");
}
