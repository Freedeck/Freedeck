let startupMessage = "";

function setStartupMessage(s) {
	startupMessage = s;
}
function getStartupMessage() {
	return startupMessage;
}

module.exports = { setStartupMessage, getStartupMessage };
