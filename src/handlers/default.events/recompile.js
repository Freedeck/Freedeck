const { compileWebpack } = require("../../webpack");
const eventNames = require("../eventNames");

module.exports = ({ io, data }) => {
	console.log("Recompiling...");
	io.emit(eventNames.default.recompile);
	compileWebpack().catch((err) => console.error(err));
};
