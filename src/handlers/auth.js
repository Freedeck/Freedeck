const eventNames = require("./eventNames");
const sec = require("../managers/secrets");
const debug = require("$/debug");
const set = require("../managers/settings");

module.exports = {
	name: "Authentication",
	id: "fd.handlers.login",
	exec: ({ socket }) => {
		if (debug.status || !set.settings().useAuthentication) {
			socket.auth = true;
		}

		socket.tempLoginID = `${Math.random() * 1024}.tlid.fd`;
		socket.on(eventNames.login.login_data, (data) => {
			if (data === socket.tempLoginID) {
				// yes
				socket.emit(eventNames.login.login_data_ack, true);
				socket.tlidMatch = true;
			} else {
				socket.emit(eventNames.login.login_data_ack, false);
				socket.tlidMatch = false;
			}
		});
		socket.on(eventNames.login.login, (data) => {
			if (!socket.tlidMatch) {
				socket.emit(eventNames.login.session_validation_failure);
				return;
			}
			if (debug.status || sec.match("password", data.passwd)) {
				socket.emit(eventNames.login.login, true);
				socket.auth = true;
			} else {
				socket.emit(eventNames.login.login, false);
				socket.auth = false;
			}
		});
	},
};
