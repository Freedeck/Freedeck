const { existsSync, writeFile, writeFileSync, rmSync } = require("node:fs");
const { paths } = require("../routers/static")
const path = require("node:path");
const { configLocation, profilesFolder } = require("../managers/settings");

const oldCfgLoc = path.resolve("./src/configs/config.fd.js");

if(existsSync(oldCfgLoc)) {
  console.log("Migrating your v1 configuration to v2 schema")
  const thatConfig = require(oldCfgLoc);
  const newMainConfig = {
    writeLogs: thatConfig.writeLogs || false,
    release: thatConfig.release || "stable",
    theme: thatConfig.theme || "default.css",
    profile: thatConfig.profile || "Default",
    screenSaverActivationTime: thatConfig.screenSaverActivationTime || 5,
    soundOnPress: thatConfig.soundOnPress || false,
    useAuthentication: thatConfig.useAuthentication || false,
    port: thatConfig.port || 5754
  };
  console.log("- Set up main.json")
  for(let profile in thatConfig.profiles) {
    const data = thatConfig.profiles[profile];
    profile = profile.replaceAll(/[/\\?%*:|"<>]/g, "");
    writeFileSync(path.resolve(profilesFolder, `${profile}.json`), JSON.stringify(data))
    console.log("- Wrote", `${profile}.json`)
  }

  writeFileSync(configLocation, JSON.stringify(newMainConfig));
  rmSync(oldCfgLoc)
  console.log("* Deleted old config.fd.js")
} 
