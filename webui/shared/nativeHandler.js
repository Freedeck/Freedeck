const updateKeys = (data) => {
	const formatted = {};
	for (const el of data) {
		// {name: 'app', friendly: 'App Name', volume: 0.5}
		formatted[el.name] = [el.friendly, el.volume];
	}
	for (const el of document.querySelectorAll(".button")) {
		if (!el.getAttribute("data-interaction")) continue;
		if (el.id === "editor-btn") continue;
		let interact = el.getAttribute("data-interaction");
		interact = JSON.parse(interact);
		if (interact.renderType === 'slider' && interact.data.app && formatted[interact.data.app]) {
			interact.data.value = formatted[interact.data.app][1] * 100;
			el.setAttribute("data-interaction", JSON.stringify(interact));
			el.querySelector(".slider-container").dataset.value =
				formatted[interact.data.app][1] * 100;
		}
	}
};

export function grabAndHandle() {
	if(universal.fdws)
	universal.fdws.send("get_apps", "");
}

const fdws = {
	cache: [],
	send: (data, ...args) => {
		universal.send(universal.events.fdws.sendRequest, [data, args]);
	},
	on: (event, callback) => {
		universal.on(`fdws_${event}`, (data) => {
			callback(data);
		});
	},
	once: (event, callback) => {
		universal.once(`fdws_${event}`, (data) => {
			callback(data);
		});
	},
	setVolume: (app, volume) => {
		fdws.send("set_volume", app, `${volume}`);
		fdws.once("volume_set", (data) => {
			fdws.cache = data;
			updateKeys(fdws.cache);
		});
	}
}

export function generic() {
	
	universal.fdws = fdws;

	universal.fdws.on("error", (data) => {
		universal.sendToast("Native WebSocket", data);
	});

	universal.fdws.on("apps", (data) => {
		universal.fdws.cache = data;
		updateKeys(data);
	});

	if(Object.values(universal.fdws.cache).length !== 0) updateKeys(universal.fdws.cache);
	grabAndHandle();
	grabAndHandle();
	universal.listenFor("page_change", () => {
		if(Object.values(universal.fdws.cache).length !== 0) updateKeys(universal.fdws.cache);
		grabAndHandle();
	});
	setInterval(() => {
		if(Object.values(universal.fdws.cache).length !== 0) updateKeys(universal.fdws.cache);
		grabAndHandle();
	}, 250);
}

const sendVolume = (app, volume) => {
	universal.fdws.setVolume(app, volume);
};

export function handler() {
	universal.on(universal.events.companion.native_keypress, (data) => {
		sendVolume(data.data.app, data.data.value);
	});

	universal.on(universal.events.keypress, (data) => {
		if (data.type === "fd.profile") {
			universal.page = 0;
			universal.save("page", universal.page);
			universal.send(universal.events.companion.set_profile, data.data.profile);
		}
		if(data.type === "fd.macro_text") {
			universal.fdws.send("macro_text", data.data.macro);
		}
		if(data.type === "fd.macro") {
			universal.fdws.send("macro", data.data.macro);
		}
		if(data.type === "fd.fullscreen") {
			// request fullscreen
			const elem = document.documentElement; // This can be any element
			if (elem.requestFullscreen) {
				elem.requestFullscreen();
			} else if (elem.mozRequestFullScreen) { // Firefox
				elem.mozRequestFullScreen();
			} else if (elem.webkitRequestFullscreen) { // Chrome, Safari, Opera
				elem.webkitRequestFullscreen();
			} else if (elem.msRequestFullscreen) { // IE/Edge
				elem.msRequestFullscreen();
			}
		}
	});
}