const path = require("node:path");
const NotificationManager = require("@managers/notifications");
const types = require("@managers/plugins");
const fs = require("node:fs");
const HookRef = require("./HookRef");

class DeprecatedPluginFormatError extends Error {}

module.exports = class Plugin {
	name;
	author;
	imports = [];
	Settings = {};
	hooks = [];
	views = {};
	id;
	disabled = false;
	stopped = false;
	hasInit = false;

	/**
	 *
	 * @param {String} name The name of the plugin
	 * @param {String} author The author of the plugin
	 * @param {String} id The ID of the plugin
	 * @param {String} disabled Is the plugin disabled?
	 * @return {Plugin} The plugin instance
	 */
	constructor(name, author, id, disabled = false) {
		throw new DeprecatedPluginFormatError("Using @freedeck/Plugin.js is no longer supported, . Please let the developer know to set this to @freedeck/api.js , and update their plugin to use the new, better documented API. this file will be deleted by FD v6.0.0-rc8")
	}

	_hookLocation = "user-data/hooks/";
	_usesAsar = true;
	/**
	 * @param {String} hook The JS file that will be loaded into the socket handler
	 */
	setJSSocketHook(hook) {
		this.internalAdd(HookRef.types.socket, hook, `${this._hookLocation}_`);
	}

	/**
	 * @param {String} hook The JS file that will be loaded into the browser
	 */
	setJSServerHook(hook) {
		this.internalAdd(HookRef.types.server, hook, this._hookLocation);
	}

	/**
	 * @param {String} hook The JS file that will be loaded into the browser
	 */
	setJSClientHook(hook) {
		this.internalAdd(HookRef.types.client, hook, this._hookLocation);
	}

	addView(view, file) {
		const viewFolder = `${file}.view`;
		this.views[view] = viewFolder;
		const viewBase = "user-data/plugin-views/";
		if (!fs.existsSync(path.resolve(viewBase, this.id)))
			fs.mkdirSync(path.resolve(viewBase, this.id), { recursive: true });
		this.internalAdd(
			HookRef.types.view,
			viewFolder,
			path.resolve(viewBase, this.id),
		);
	}

	/**
   Internal method for adding hookrefs
   @param {*} type the HookRef type
   @param {*} hook File path to hook
   @param {*} copyTo folder to copy hook to
   */
	internalAdd(type, hook, copyTo) {
		let foundPath = `tmp/_${this.id}.fdpackage`;
		if (this._usesAsar) foundPath = `tmp/_e_._plugins_${this.id}.Freedeck`;
		const hp = path.resolve(foundPath, hook);

		if (!fs.existsSync(hp)) {
			console.log(`Source file does not exist: ${hp}`);
			return;
		}

		this.hooks.push(new HookRef(hp, type, hook));

		const destination = path.resolve(copyTo, path.dirname(hook));

		if (!fs.existsSync(destination)) {
			fs.mkdirSync(destination, { recursive: true });
		}
		const dt = { force: true };
		if (type === HookRef.types.view) {
			dt.recursive = true;
		}

		setImmediate(() => {
			fs.cp(hp, path.resolve(destination, path.basename(hook)), dt, (err) => {
				if (err) {
					console.log(`Failed to copy hook: ${err}`);
				} else {
				}
			});
		});
	}

	/**
	 * @param {String} file The file you want to import
	 */
	addImport(file) {
		this.imports.push(file);
		this.tempImportPath = path.resolve(
			`tmp/_e_._plugins_${this.id}.Freedeck`,
			file,
		);
		fs.cpSync(this.tempImportPath, path.resolve(`user-data/hooks/${file}`));
	}

	/**
	 * @return {String} The JS file that will be loaded into the browser
	 */
	getJSServerHook() {
		return this.hooks.filter((ref) => ref.type === HookRef.types.server);
	}

	/**
	 * @return {String} The JS file that will be loaded into the browser
	 */
	getJSClientHook() {
		return this.hooks.filter((ref) => ref.type === HookRef.types.client);
	}

	/**
	 * Create save data folders/file structure for the plugin.
	 */
	createSaveData() {
		if (!fs.existsSync(path.resolve("./plugins"))) {
			fs.mkdirSync(path.resolve("./plugins"));
			console.log("Failsafe created plugins folder!");
		}
		if (!fs.existsSync(path.resolve(`./plugins/${this.id}`))) {
			fs.mkdirSync(path.resolve(`./plugins/${this.id}`));
			console.log(`Created ${this.id} data folder!`);
		}
		if (!fs.existsSync(path.resolve(`./plugins/${this.id}/settings.json`))) {
			fs.writeFileSync(
				path.resolve(`./plugins/${this.id}/settings.json`),
				JSON.stringify({}),
			);
		}
	}

	/**
	 * Get from the save data.
	 * @param {String} k The key to get from the save data
	 * @return {*} The value from the save data
	 */
	getFromSaveData(k) {
		this.createSaveData();
		const data = JSON.parse(
			fs.readFileSync(path.resolve(`./plugins/${this.id}/settings.json`)),
		);
		return data[k];
	}

	/**
	 * Add to the save data.
	 * @param {String} k The key to set in the save data
	 * @param {*} v The data to set in the save data
	 */
	setToSaveData(k, v) {
		this.createSaveData();
		const data = JSON.parse(
			fs.readFileSync(path.resolve(`./plugins/${this.id}/settings.json`)),
		);
		data[k] = v;
		fs.writeFileSync(
			path.resolve(`./plugins/${this.id}/settings.json`),
			JSON.stringify(data),
		);
	}

	/**
	 * Add a notification to the queue.
	 * @param {String} value The notification's content
	 * @param {Object} options Extra options for the notification
	 */
	pushNotification(value, options = null) {
		if (!options) NotificationManager.add(this.name, `<br>${value}`);
		if (options != null && Object.keys(options).length > 0) {
			if (options.image) {
				NotificationManager.add(
					this.name,
					`<br><img src='${options.image}' width='50' height='50'><br>${value}`,
				);
			}
		}
	}

	/**
	 * Register a new type for Companion
	 * @param {String} name The name of the button type
	 * @param {String} type The identifier for the button type
	 * @param {Object} templateData The data for the button type
	 * @param {String} renderType The type of button to render
	 */
	registerNewType(name, type, templateData = {}, renderType = "button") {
		this.types.push({
			name,
			type,
			renderType,
			templateData,
			pluginId: this.id,
			display: this.name,
		});
		types
			.types()
			.set(type, { instance: this, display: name, renderType, templateData });
	}

	/**
	 * Remove a type from Companion
	 * @param {String} type The identifier for the button type
	 * @return {Boolean} If the type was removed successfully
	 */
	deregisterType(type) {
		if (types.types().has(type)) {
			types.types().delete(type);
			this.types = this.types.filter((t) => t.type !== type);
			return true;
		}
		return false;
	}

	/**
	 * Code to run when the plugin is initialized.
	 * @return {Boolean} If the plugin initialized successfully
	 */
	onInitialize() {
		return true;
	}

	/**
	 * Code to run when a button that is registered to this plugin is pressed.
	 * @param {Object} interaction The button's interaction data
	 * @return {Boolean} If the button press/interaction handling was successful
	 */
	onButton(interaction) {
		return true;
	}

	/**
	 * Code to run when the plugin is stopping.
	 */
	onStopping() {}

	/**
	 * End the plugin.
	 */
	stop() {
		this.onStopping();
		this.disabled = true;
		this.stopped = true;
	}

	/**
	 * Check if the plugin is running in the development environment.
	 * @return {Boolean} If the development environment is active
	 */
	isDev() {
		return false;
	}
};
