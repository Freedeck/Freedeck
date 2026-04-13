require("module-alias/register");
const { recordTime } = require("$/timer");
recordTime("FST-STARTUP");

const path = require("node:path");

const picocolors = require('$/picocolors.js')

const { version } = require(path.resolve("package.json"));
console.log(`Freedeck v${version} Self-Test`);

recordTime("fst-server:http-begin");
require(path.resolve("src/http.js"));
recordTime("fst-server:http-complete");

const config = require("@managers/settings");
const settings = config.settings();

const networkAddresses = require("@managers/networkAddresses");
const netAddresses = networkAddresses();

function testHTTP() {
	return new Promise(async (resolve, reject) => {
    try {
      const promises = Object.keys(netAddresses).map(netInterface => fetch(`http://${netAddresses[netInterface][0]}:${settings.port}/api/discover`).catch((e)=>false).then(res => true));
      const results = await Promise.all(promises);
      resolve(results);
    }catch(err){
      reject(err)
    }
	});
}

(async () => {
	testHTTP().then((states) => {
		const reachableOn = Object.values(states).filter((e) => e == true).length;
		const tot = states.length;

		console.log(
			"HTTP is discoverable on " + reachableOn + "/" + tot + " interfaces",
		);
		console.log(
			"Assumed: " + (reachableOn >= tot - reachableOn ? "LIVE" : "UNREACHABLE"),
		);
	});
})();

console.log("Loaded HTTP, beginning socket.io");
require('./server.js')

console.log(picocolors.bgGreen('All pre-init tests complete!'))

console.log('> Now testing: Plugin Manager')

const testPlugin = path.resolve('src/test/fst.src');
console.log('Forcefully adding to plugins')

console.log('> Copying to plugins')

const {cpSync, rmSync} = require('fs');
cpSync(testPlugin, path.resolve('plugins/fst.src'), {recursive:true});

const plgm = require('@managers/plugins.js');
plgm.load(path.resolve('plugins/fst.src'))

rmSync(path.resolve('plugins/fst.src'));
console.log('> Cleaned plugins dir')