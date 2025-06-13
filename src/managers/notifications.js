const { EventEmitter } = require("node:events");

class NotificationManager extends EventEmitter {
	constructor() {
		super();
		this._cache = [];
	}

	add(sender, data) {
		const notification = { sender, data };
		this._cache.push(notification);
		this.emit("newNotification", notification);
	}

	get() {
		return this._cache.shift();
	}
}

module.exports = new NotificationManager();
