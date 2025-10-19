/** A hook! */
module.exports = class HookRef {
	#file;
	type;
	name;
	/** The various types for specifying what a hook's behavior is. */
	static types = {
		/** Used to specify the hook will be used on Freedeck Client*/
		client: 0,
		/** Used to specify the hook will be used on Freedeck Companion*/
		server: 1,
		/** @deprecated Superseded by this.io and the intent system.*/
		socket: 2,
		/** Used to specify a file copy into the hooks folder as an import.*/
		import: 3,
		/** Used to specify an editor view/button for deeply integrated button types.*/
		view: 4,
		/** Used to specify a Dash module-- part of the Freedeck NewUI update.*/
		dashModule: 5,
	};

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

	/**
	 * Securely execute a server-side hook without revealing it's path through the object.
	 * @param  {...any} args Any arguments you want to pass to the server-side hook
	 */
	execute(...args) {
		require(this.#file)(...args);
	}
};
