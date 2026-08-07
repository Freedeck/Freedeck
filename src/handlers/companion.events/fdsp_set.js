const plugins = require("@managers/plugins");
const fs = require("node:fs");
const eventNames = require("../eventNames");
const path = require("node:path");
const NotificationManager = require("@managers/notifications.js");
const { events } = require("@freedeck/api");

module.exports = ({ io, data }) => {
	if (plugins.plugins().has(data.plugin)) {
		const plugin = plugins.plugins().get(data.plugin).instance;
		const { allowed, name } = plugin.Settings[data.setting.id.toLowerCase()];
		if (allowed && allowed.length > 0 && allowed.includes(data.userValue)) {
			plugin.setSetting(data.setting.id, data.userValue);
			plugin.emit(events.settingsChanged, data);
		} else if (allowed.length == 0) {
			plugin.setSetting(data.setting.id, data.userValue);
			plugin.emit(events.settingsChanged, data);
		} else {
			plugin.pushNotification(
				"Couldn't set " + name + ": Allowed values are " + allowed.join(", "),
			);
		}
	} else {
		NotificationManager.add("Error", data.plugin + " doesn't exist!");
	}
};
