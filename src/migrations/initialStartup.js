const fs = require("node:fs");
const path = require("node:path");
if(!fs.existsSync(path.resolve("plugins"))) fs.mkdirSync(path.resolve("plugins"));
if(!fs.existsSync(path.resolve("src/configs/profiles"))) fs.mkdirSync(path.resolve("src/configs/profiles"));