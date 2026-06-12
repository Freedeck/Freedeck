const { clients } = require("@managers/serverClientelle");
const { gatherServerInformation } = require("@managers/serverInformationGatherer");
const eventNames = require("../eventNames");

module.exports = async ({ io }) => {
	// io.emit(eventNames.default.reload);
	for(const socket of clients) {
			socket.emit(eventNames.information, await gatherServerInformation(socket))
	}
};
