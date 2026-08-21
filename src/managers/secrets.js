const path = require("node:path");
const secretsLoc = path.resolve("user-data/config/secrets.fd.js");
const secrets = require(secretsLoc);

const sm = {
	match: (k, v) => secrets.s[k] === secrets.hash(v),
	hash: (k) => secrets.hash(k),
	equals: (k, v) => secrets.s[k] === v,
};

module.exports = sm;
