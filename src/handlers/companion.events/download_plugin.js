const config = require("@managers/settings");
const eventNames = require("@handlers/eventNames");
const { createWriteStream, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");
const http= require('node:http');
const pl = require("@managers/plugins");
const pluginsLocation = resolve("./plugins");

let timeAtLastTileCreation = 0;
module.exports = {
	flags: ["AUTH"],
	exec: async ({ socket, data }) => {
		socket.emit(eventNames.companion.download_plugin, {percent:10,stage: "marketplace.download.stage_download"})
		const response = await fetch(data.plugin.download);
		socket.emit(eventNames.companion.download_plugin, {percent:30,stage: "marketplace.download.stage_download"})
		const arrBuf = await response.arrayBuffer();
		socket.emit(eventNames.companion.download_plugin, {percent:50,stage: "marketplace.download.stage_write"})
		writeFileSync(resolve(pluginsLocation+"/" + data.plugin.id+".fdpackage"),Buffer.from(arrBuf))
		socket.emit(eventNames.companion.download_plugin, {percent:75,stage: "marketplace.download.stage_load"})
		await pl.reload();
		socket.emit(eventNames.companion.download_plugin, {percent:100,stage: "marketplace.download.finished"})
		setTimeout(() => {
			socket.emit(eventNames.default.reload);
		}, 1000);
	},
};
