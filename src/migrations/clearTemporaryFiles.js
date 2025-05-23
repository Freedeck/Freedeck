const path = require('node:path');
const fs = require('node:fs');
const debug = require("$/debug");
const picocolors = require("$/picocolors");

const routines = [
  "./tmp",
  "./user-data/hooks",
  "./user-data/plugin-views",
  "./user-data/themes"
]

for(const i of routines) {
  const p = path.resolve(i);
  fs.rmSync(p, {recursive:true,force:true})
  fs.mkdirSync(i);
  debug.log(`Cleaned up ${i}`, picocolors.blue("Migration / Cleaner"))
}
