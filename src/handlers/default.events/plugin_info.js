const plugins = require("@managers/plugins").plugins;
const eventNames = require("@handlers/eventNames");

module.exports = ({ socket, data }) => {
	const plug = plugins().get(data);
	socket.emit(
		eventNames.default.plugin_info,
		JSON.stringify({
			requested: data,
			response: plug,
		}),
	);
};
