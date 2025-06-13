module.exports = class HookRef {
	#file;
	type;
	static types = {
		client: 0,
		server: 1,
		socket: 2,
		import: 3,
		view: 4,
	};
	name;

	/**
	 * Create a new hook file reference
	 * @param {*} file The file path of the hook
	 * @param {HookRef.types} type The path (specified HookRef.types)
	 * @param {*} name The name (usually file) of the hook
	 */
	constructor(file, type, name) {
		this.#file = file;
		this.type = type;
		this.name = name;
	}
	execute(...args) {
		require(this.#file)(...args)
	}
};
