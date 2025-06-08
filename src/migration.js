const {recordTime} = require("$/timer")

const fs = require("node:fs");
const path = require("node:path");
const debug = require("$/debug");
recordTime("server:migration-begin")
debug.log("Gathering migrations...", "Migration");
for(const file of fs.readdirSync(path.resolve("./src/migrations"))) {
  debug.log(`Running migration ${file}...`, "Migration");
  recordTime(`server:migration-task-begin,${file}`)
  require(path.resolve(`./src/migrations/${file}`));
  recordTime(`server:migration-task-complete,${file}`)
};

if (!fs.existsSync("plugins")) {
  recordTime("server:migration-task-begin,make-plugins-folder")
  debug.log("Creating plugins directory...", "Migration");
  fs.mkdirSync("plugins");
  recordTime("server:migration-task-complete,make-plugins-folder")
}


if(fs.existsSync("src/public/dist")) {
  recordTime("server:migration-task-begin,clean-old-webpack")
  debug.log("Found old webpack build. Cleaning up...", "Migration");
  fs.rmSync("src/public/dist", { recursive: true });
  recordTime("server:migration-task-complete,clean-old-webpack")
}




debug.log("Migration complete.", "Migration");
recordTime("server:migration-complete")