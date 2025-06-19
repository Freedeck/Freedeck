const path = require('node:path');
const fs = require('node:fs');
const debug = require("$/debug");
const picocolors = require("$/picocolors");

// Add a clear routine
// [PATH:string, SHOULD_REMAKE:boolean]
const routines = [
  ["./tmp",true],
  ["./user-data/hooks",true],
  ["./user-data/plugin-views",true],
  ["./user-data/dash-modules",true],
  ["./user-data/themes",true],
  ["./user-data/logs",true],
  ["./webui/hooks",false],
  ["./webui/app",false],
]

for(const [i, shouldRemake] of routines) {
  const p = path.resolve(i);
  if(fs.existsSync(p)) fs.rmSync(p, {recursive:true,force:true})
  if(shouldRemake) fs.mkdirSync(i);
  debug.log(`Cleaned up ${i}`, picocolors.blue("Migration / Cleaner"))
}
