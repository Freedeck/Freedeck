const plugins = require("@managers/plugins");
const fs = require("node:fs");
const eventNames = require("../eventNames");
const path = require("node:path");
const NotificationManager = require("@managers/notifications.js");
const { events } = require("@freedeck/api");

module.exports = ({ io, data }) => {
	if (plugins.plugins().has(data.plugin)) {
		const plugin = plugins.plugins().get(data.plugin).instance;
		if (
			data.setting.allowed &&
			data.setting.allowed.length > 0 &&
			data.setting.allowed.includes(data.userValue)
		) {
			plugin.setSetting(data.setting.id, data.userValue);
			plugin.emit(events.settingsChanged, data);
		} else if (!data.setting.allowed) {
			plugin.setSetting(data.setting.id, data.userValue);
			plugin.emit(events.settingsChanged, data);
		} else {
			plugin.pushNotification(
				"Couldn't set " +
					data.setting.name +
					": Allowed values are " +
					data.setting.allowed.join(", "),
			);
		}
	} else {
		NotificationManager.add("Error", data.plugin + " doesn't exist!");
	}
};
