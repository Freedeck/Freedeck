const { match, hash, equals } = require("@managers/secrets");

const aac = {
	expiryInMs: 3000 * 10, // 3000ms * 10 = 30 seconds
	_registry: {},
	register: (id, password, hashed = false) => {
		const passwordEquality = hashed
			? match("password", password)
			: equals("password", password);
		const notInRegistryOrExpired =
			!aac._registry[id] ||
			Math.abs(aac._registry[id].given - Date.now()) >= aac.expiryInMs;
		if (passwordEquality && notInRegistryOrExpired) {
			const token = hash(`${id}.FD_AAC`).substring(0, 32);
			const hashed = Date.now();
			aac._registry[id] = {
				token,
				given: hashed,
				expiresAt: hashed + aac.expiryInMs,
			};
			return aac._registry[id];
		}
		return { token: null, given: -1, expiresIn: -1 + aac.expiryInMs };
	},
	check: (ctoken) => {
		for (const key in aac._registry) {
			const { token, given } = aac._registry[key];
			if (ctoken === token) {
				const i = Math.abs(given - Date.now()) <= aac.expiryInMs;
				if (!i) delete aac._registry[key];
				return i;
			}
		}
		return false;
	},
};

module.exports = aac;
