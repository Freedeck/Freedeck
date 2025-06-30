const { match, hash, equals } = require("./secrets");

const aac = {
	expiryInMs: 3000 * 10, // 3000ms * 10 = 30 seconds
	_registry: {},
	register: (id, password, hashed=false) => {
		if((hashed ? match("password", password) : equals("password", password)) && (!aac._registry[id] || Math.abs(aac._registry[id].given - Date.now()) <= aac.expiryInMs)) {
			const token = hash(`${id}.FD_AAC`).substring(0,32);
			this._registry[id] = {
				token,
				given: Date.now()
			}
			return token;
		}
		return false;
	},
	check: (ctoken) => {
		for(const key in aac._registry) {
			const {token, given} = aac._registry
			if(ctoken === token) {
				const i = Math.abs(given - Date.now()) <= aac.expiryInMs;
				if(!i) delete aac._registry[key];
				return i;
			}
		}
		return false;
	},
};

module.exports = aac;
