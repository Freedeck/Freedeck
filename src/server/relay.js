const eventNames = require("@handlers/eventNames");
const fs = require("node:fs");
const path = require("node:path");
const { getWs } = require("../routers/connect");

let RelayStatus = false;

function startRelay(handleSock) {
	const relayClient = require("socket.io-client")("http://localhost:3000");
	relayClient.on("connect", () => {
		RelayStatus = true;
		// const rlc = Math.random().toString(36).substring(7);
		const rlc = "kctonp";
		relayClient.emit(eventNames.relay.identify, rlc);
		if (!relayClient._id) handleSock(relayClient);
		relayClient.on(eventNames.relay.request, (upath, raw) => {
			console.log(raw);
			const allowed = [
				"",
				"app",
				"common",
				"user-data",
				"companion",
				"shared",
				"hooks",
			];

			if (!allowed.some((a) => upath.startsWith(a))) {
				relayClient.emit(eventNames.relay.file, [
					"Directory break detected.",
					"text/plain",
					upath,
				]);
				return;
			}

			let folder = "client";
			if (upath.includes("companion")) folder = "companion";
			if (upath.includes("shared")) folder = "shared";
			if (upath.includes("user-data")) {
				folder = "../user-data";
			}
			if (upath.includes("hooks")) {
				folder = "../user-data";
			}
			if (upath.includes("app")) folder = "app";
			if (upath.includes(".ttf")) folder = "client/fonts";
			if (upath.includes("common")) folder = "common";

			if (upath.includes("connect/webpack")) {
				relayClient.emit(eventNames.relay.file, [
					JSON.stringify({ compiled: getWs() }),
					"text/plain",
					upath,
				]);
				return;
			}

			let file = upath.split("/");
			if (upath.split("/").length > 1) {
				file.shift();
			}
			if (upath.includes("app") && upath.includes("shared")) {
				folder = "shared";
				file.shift();
			}
			file = file.join("/");

			console.log(folder, file, upath);

			if (file === "") file = "index.html";
			const wantedFile = path.resolve(`webui/${folder}/${file}`);
			if (!fs.existsSync(wantedFile)) {
				relayClient.emit(eventNames.relay.file, [
					"Couldnt find the file.",
					"text/plain",
					upath,
				]);
				return;
			}
			const f = fs.readFileSync(wantedFile, "utf8");
			let mimeType = "text/plain";
			console.log(file.split(".").pop());
			switch (file.split(".").pop()) {
				case "js":
					mimeType = "text/javascript";
					break;
				case "css":
					mimeType = "text/css";
					break;
				case "html":
					mimeType = "text/html";
					break;
				case "ttf":
					mimeType = "font/ttf";
					break;
			}
			relayClient.emit(eventNames.relay.file, [f, mimeType, upath]);
		});
		relayClient.on(eventNames.relay.error, (err) => {
			if (err[1] === -1) {
				// Device already exists
				console.log("Device already exists, disconnecting and reconnecting");
				relayClient.disconnect();
				startRelay(handleSock);
				return;
			}
		});
		relayClient.on(eventNames.relay.opened, () => {
			console.log(`

Relay connection opened
Connect with code ${rlc}

        `);
		});
		relayClient.on("disconnect", () => {
			RelayStatus = false;
			console.log("Disconnected from relay server");
			relayClient.disconnect();
			const wait = setInterval(() => {
				if (!RelayStatus) {
					clearInterval(wait);
					startRelay(handleSock);
				}
			}, 1000);
		});
	});
}

module.exports = {
	startRelay,
};
