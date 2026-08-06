const path = require('node:path');
const fs = require('node:fs');
const debug = require("$/debug");
const picocolors = require("$/picocolors");
const {version} = JSON.parse(fs.readFileSync(path.resolve('package.json')));

(async () => {
  const marketplaceServer = "https://releases.freedeck.app/index.json";

  const fet = await fetch(marketplaceServer);
  const res = await fet.json();
  
  debug.log(`Got Marketplace index`, picocolors.blue("Migration / Updates"));

  const regexDev = /d-rc(\d*)/;
  const regexRelease = /[^d]-rc(\d*)/;
  let versionRegex = version.match(regexDev) ? regexDev : regexRelease;
  const channel = (versionRegex == regexDev) ? "dev": "stable";
  debug.log(`Detected channel ${channel}.`, picocolors.blue("Migration / Updates"));
  try {
    const latestUpstream = res.channels[channel].latest;

    const compareOurs = Number.parseInt(version.match(versionRegex)[1]);
    const compareUpstream = Number.parseInt(latestUpstream.match(versionRegex)[1])
    debug.log(`Ours: ${compareOurs}, Upstream: ${compareUpstream}`, picocolors.blue("Migration / Updates"));
    if(compareOurs > compareUpstream) {
      console.log('Freedeck is more than up to date!')
    } else if(compareUpstream > compareOurs) {
      console.log('Freedeck has been marked for autoupdate.')
      fs.writeFileSync(path.resolve('freedeck.autoupdate'), 'Freedeck will be updated to version '+ latestUpstream + ' (or newer) from ' + version+'.');
    } else if(compareUpstream == compareOurs) {
      console.log('Freedeck is up to date!')
    } else {
      console.log('Version discrepancy, ours is ' + version +' and upstream\'s is ' + latestUpstream);
    }
  } catch(err) {
    console.log('Error while checking for updates:',err)
  }
})();