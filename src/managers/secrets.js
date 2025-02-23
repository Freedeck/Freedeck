const path = require("node:path");
const secretsLoc = path.resolve("./src/configs/secrets.fd.js");
const secrets = require(secretsLoc);

const sm = {
	match: (k, v) => secrets.s[k] === secrets.hash(v),
	hash: (k) => secrets.hash(k),
};

module.exports = sm;
