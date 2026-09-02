const fs = require('node:fs');
const path = require('node:path');

const from = "src/configs";
const to = "user-data/config";

if(fs.existsSync(from)) {
  fs.cpSync(from,to, {recursive: true,force:true})
  fs.rmSync(from,{recursive:true, force:true});
}

const debug = require("$/debug");
const picocolors = require("$/picocolors");

debug.log("Migrated configuration to user-data folder.", picocolors.blue("Migration / Config -> UserData"));