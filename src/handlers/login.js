const eventNames = require("./eventNames");
const sec = require("../managers/secrets");
const debug = require("$/debug");

module.exports = {
	name: "Login",
	id: "fd.handlers.login",
	exec: ({ socket }) => {
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
