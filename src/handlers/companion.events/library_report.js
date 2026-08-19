const eventNames = require("@handlers/eventNames");
const { readdirSync } = require("node:fs");
const { paths } = require("@routers/static.js");

module.exports = {
	flags: ["AUTH"],
	exec: async ({ socket, data }) => {
		socket.emit(eventNames.companion.library_report, {
			icons: readdirSync(paths.userData_icons),
			sounds: readdirSync(paths.userData_sounds),
		});
	},
};
