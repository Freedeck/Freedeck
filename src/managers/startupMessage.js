let startupMessage = "Server just started";
let crashMessage = null;

function setStartupMessage(s) {
	startupMessage = s;
}
function getStartupMessage() {
	return startupMessage;
}
function setCrashMessage(s) {
	crashMessage = s;
}

function getCrashMessage() {
	return crashMessage
}

module.exports = { setStartupMessage, getStartupMessage, setCrashMessage, getCrashMessage };
