const { Plugin, HookRef, intents } = require("@freedeck/api");

class Clock extends Plugin {
	setup() {
		this.add(HookRef.types.server, "clock/client.js");
		this.add(HookRef.types.client, "clock/client.js");

		this.register({
			display: "Time (12h, seconds)",
			type: "clock.time",
		});

		this.register({
			display: "Time (24h, seconds)",
			type: "clock.time",
		});

		this.register({
			display: "Date",
			type: "clock.date",
		});

		return true;
	}
}

module.exports = {
	exec: () => new Clock(),
	class: Clock,
};
