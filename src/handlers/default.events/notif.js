const NotificationManager = require("@managers/notifications");

module.exports = ({ data }) => {
	if (typeof data !== "object" || data === null || !data.sender || !data.data) {
		return;
	}
	NotificationManager.add(data.sender, data.data);
};
