const { networkInterfaces } = require("node:os");
const debug = require("$/debug.js");

const getNetworkInterfaces = () => {
	const nets = networkInterfaces();
	const results = {};
	for (const name of Object.keys(nets)) {
		for (const net of nets[name]) {
			const familyV4Value = typeof net.family === "string" ? "IPv4" : 4;
			if (net.family === familyV4Value && !net.internal) {
				if (!results[name]) {
					results[name] = [];
				}
				results[name].push(net.address);
			}
		}
	}
	debug.log("Network interfaces loaded.", "Network");
	return results;
};

module.exports = getNetworkInterfaces;
