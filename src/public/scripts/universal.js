import Pako from "pako";
import { generic, handler } from "../companion/scripts/native/handler";
import dataHandler from "./init/data";
import eventsHandler from "./init/events";
import themeIndex from "./theming/themeIndex";
import { UI } from "./ui";

/**
 * Open the settings menu (on clients only)
 */
function settingsMenu() {
	if (universal.name === "Main") {
		document.querySelector(".settings-menu").style.display = "flex";
	}
}

const universal = {
	_socket: null,
	_ca: [],
	lastRetry: -1,
	connected: false,
	reconnect: () => {
		universal.connected = false;
		universal.lastRetry = new Date();
		universal._socket.connect();
		universal._ca.push(universal.lastRetry);
	},
	lclCfg() {
		return universal._information.style;
	},
	_information: {},
	_init: false,
	_authStatus: false,
	_tyc: new Map(),
	_serverRequiresAuth: true,
	page: 0,
	events: {},
	config: {},
	_loginAllowed: false,
	keys: document.querySelector("#keys")
		? document.querySelector("#keys")
		: document.createElement("div"),
	notibar: document.querySelector("#snackbar")
		? document.querySelector("#snackbar")
		: document.createElement("div"),
	save: (k, v) => {
		return localStorage.setItem(btoa(`fd.${k}`), btoa(v));
	},
	load: (k) => {
		return atob(localStorage.getItem(btoa(`fd.${k}`)));
	},
	remove: (k) => {
		return localStorage.removeItem(btoa(`fd.${k}`));
	},
	exists: (k) => {
		return !!localStorage.getItem(btoa(`fd.${k}`));
	},
	loadObj: (k) => {
		return JSON.parse(atob(localStorage.getItem(btoa(`fd.${k}`))));
	},
	default: (k, v) => {
		return universal.exists(k) ? universal.load(k) : universal.save(k, v);
	},
	storage: {
		keys: () => {
			const _keys = [];
			for (let key of Object.keys(localStorage)) {
				key = atob(key);
				if (key.startsWith("fd.")) {
					_keys.push(key);
				}
			}
			return _keys;
		},
		reset: () => {
			for (let key of Object.keys(localStorage)) {
				key = atob(key);
				if (key.startsWith("fd.")) {
					localStorage.removeItem(key);
				}
				location.reload();
			}
		},
	},
	showSpinner: (e = document.body) => {
		const elem = document.createElement("div");
		elem.className = "spinner";
		e.appendChild(elem);
	},
	updatePlaying: () => {
		if (document.querySelector(".now-playing")) {
			const fixed = [];
			for (const itm of universal.audioClient._nowPlaying) {
				fixed.push(itm.getAttribute("data-name"));
			}
			document.querySelector(".now-playing").innerText = fixed;
		}
	},
	embedded_settings: {
		createSelect: async (
			label,
			name,
			optionsPromise,
			labelsPromise,
			selected,
			eventHandler = () => {},
		) => {
			const container = document.createElement("div");
			container.className = "es-setting";

			const select = document.createElement("select");
			select.id = name;

			const lbl = document.createElement("label");
			lbl.innerText = label;
			lbl.htmlFor = name;
			container.appendChild(lbl);
			container.appendChild(select);
			// Assuming optionsPromise is a Promise that resolves to an array of options
			const options = await optionsPromise;
			const labels = await labelsPromise;
			for (const option of options) {
				const opt = document.createElement("option");
				opt.value = option;
				opt.innerText = labels[options.indexOf(option)];
				if (option === selected) opt.selected = true;
				select.appendChild(opt);
			}
			// select the first option if none are selected
			if (select.selectedIndex === -1) select.selectedIndex = 0;
			select.onchange = eventHandler;
			return container;
		},
	},
	audioClient: {
		_nowPlaying: [],
		_end: (event) => {
			universal.audioClient._nowPlaying.splice(
				universal.audioClient._nowPlaying.indexOf(event.target),
				1,
			);
			universal.updatePlaying();
		},
		_player: {
			sink: 0,
			monitorPotential: [],
			monitorSink: "default",
			recsink: 0,
			normalVol: 1,
			monitorVol: 1,
			pitch: 1,
		},
		stopAll: async () => {
			for (const audio of universal.audioClient._nowPlaying) {
				try {
					await audio.pause();
					audio.currentTime = audio.duration;
					await audio.play();
				} catch (err) {
					// "waah waah waah noo you cant just abuse audio api" -companion
					// > i dont care :trole:
				}
			}
		},
		setPitch: (pitch) => {
			universal.audioClient._player.pitch = pitch;
			for (const audio of universal.audioClient._nowPlaying) {
				audio.playbackRate = pitch;
			}
			universal.save("pitch", pitch);
			document.querySelector("#pitch").value = pitch;
		},
		setVolume: (vol) => {
			universal.audioClient._player.normalVol = vol;
			for (const audio of universal.audioClient._nowPlaying) {
				audio.volume = vol;
			}
			universal.save("vol", vol);
			document.querySelector("#v").value = vol;
		},
		play: async (
			file,
			name,
			isMonitor = false,
			stopPrevious = false,
			volume = universal.load("vol") || 1,
		) => {
			const audioInstance = new Audio();
			audioInstance.src = file;
			audioInstance.load();
			if (universal.audioClient._player.sink !== 0) {
				navigator.mediaDevices.getUserMedia({ audio: true, video: false });
				await audioInstance.setSinkId(universal.audioClient._player.sink);
			}
			audioInstance.setAttribute("data-name", name);
			audioInstance.setAttribute("data-isMonitor", false);

			if (isMonitor) {
				navigator.mediaDevices.getUserMedia({ audio: true, video: false });
				await audioInstance.setSinkId(
					universal.audioClient._player.monitorSink,
				);
				if (universal.load("monitor.sink")) {
					navigator.mediaDevices.getUserMedia({ audio: true, video: false });
					await audioInstance.setSinkId(universal.load("monitor.sink"));
				}
				audioInstance.volume = universal.audioClient._player.monitorVol;
			} else {
				audioInstance.volume = universal.audioClient._player.normalVol;
			}
			if (universal.load("pitch")) {
				audioInstance.playbackRate = universal.load("pitch");
			}
			audioInstance.volume = volume;
			audioInstance.preservesPitch = false;
			audioInstance.fda = {};
			audioInstance.fda.name = name;
			audioInstance.fda.monitoring = isMonitor;
			if (stopPrevious === "stop_prev") {
				for (const audio of universal.audioClient._nowPlaying) {
					try {
						if (audio.fda.name === audioInstance.fda.name) {
							await audio.pause();
							audio.currentTime = audio.duration;
							await audio.play();
						}
					} catch (err) {
						// "waah waah waah noo you cant just abuse audio api" -companion
						// > i dont care :trole:
					}
				}
			}
			await audioInstance.play();

			audioInstance.onended = (ev) => {
				universal.audioClient._end(ev);
			};

			universal.audioClient._nowPlaying.push(audioInstance);
			universal.updatePlaying();
			return audioInstance;
		},
	},
	login: (passwd) => {
		universal.send(universal.events.login.login_data, {
			tlid: universal._information.tempLoginID,
		});
		universal.send(universal.events.login.login, { passwd });
	},
	themeData: {},
	themes: themeIndex /* Theme list */,
	setTheme: (name, global = true) => {
		let fu = name;
		fetch(`/scripts/theming/${name}/manifest.json`)
			.then((res) => res.json())
			.then((json) => {
				fu = json.theme;
			})
			.catch(() => {
				console.log("Theme not found, back to default.");
				universal.setTheme("default", true);
			});
		fetch(`/scripts/theming/${name}/${fu}.css`)
			.then((res) => res.text())
			.then((css) => {
				const stylea = document.createElement("style");
				stylea.innerText += css;
				document.body.appendChild(stylea);
				universal.save("theme", name);
				const dStyle = getComputedStyle(document.body);
				universal.themeData = {
					name: dStyle.getPropertyValue("--theme-name"),
					author: dStyle.getPropertyValue("--theme-author"),
					description: dStyle.getPropertyValue("--theme-description"),
				};
				if (global) universal.send(universal.events.companion.set_theme, name);
				universal.save("theme", name);
			});
	},
	imported_scripts: [],
	import: (script) => {
		universal.imported_scripts.push(script);
		const scriptElement = document.createElement("script");
		scriptElement.src = script;
		scriptElement.id = script.split("/").pop().split(".").shift();
		document.body.appendChild(scriptElement);
	},
	CL: true,
	CLU: (s, ...m) => (universal.CL ? console.log(`${s}:`, ...m) : false),
	init: (user) =>
		new Promise((resolve, reject) => {
			universal.CLU("Boot", "Init promise created");
			try {
				universal.CLU("Boot", "Pre-init");
				universal._initFn(user).then(async () => {
					universal.CLU("Boot", "Init complete");
					universal.CLU("Boot", "Received config", universal.config);
					universal.setTheme(
						universal.config.theme ? universal.config.theme : "default",
						false,
					);
					universal.CLU("Boot", "Set theme");
					universal.config.iconCountPerPage =
						universal.lclCfg().iconCountPerPage || 12;
					UI.reloadSounds();
					universal.CLU("Boot", "UI reloaded");
					if (!navigator.mediaDevices?.enumerateDevices) {
						console.log("enumerateDevices() not supported.");
					} else {
						const devices = [];
						navigator.mediaDevices
							.enumerateDevices()
							.then((devices) =>
								devices.filter((device) => device.kind === "audiooutput"),
							)
							.catch((err) => {
								console.error(err);
							});
						for (const device of devices) {
							universal.audioClient._player.monitorPotential.push(device);
							universal.CLU("Boot", "Created monitor potential devices");
						}
					}
					if (universal.lclCfg().fill) {
						const style = document.createElement("style");
						style.type = "text/css";
						const styles = `
                #keys .button {
                width: unset; height: unset;
                }
            `;
						if (style.styleSheet) style.styleSheet.cssText = styles;
						else style.appendChild(document.createTextNode(styles));
						document.head.appendChild(style);
					}
					if (universal.load("vb.sink"))
						universal.audioClient._player.sink = universal.load("vb.sink");
					universal.CLU("Boot", "Loaded vb.sink");
					if (universal.load("monitor.sink"))
						universal.audioClient._player.monitorSink =
							universal.load("monitor.sink");
					else universal.audioClient._player.monitorSink = "default";
					universal.CLU("Boot", "Loaded monitor.sink");
					universal.CLU("Boot", "Init complete");
					resolve(true);
				});
			} catch (e) {
				console.error(`${e} | Universal: initialize failed.`);
				reject(e);
			}
		}),
	/* repos */
	repositoryManager: {
		official: [
			{
				title: "freedeck.app",
				who: "Official Freedeck Repository",
				link: "https://freedeck.app/_fd/repository.php",
			},
		],
		unofficial: [],
		getPluginsfromRepo: async (url) => {
			const _plugins = [];
			const res = await fetch(url);
			const data = await res.text();
			if (res.status !== 200)
				return [
					{
						err: true,
						msg: `Repository not found. Server returned ${res.status}`,
					},
				];
			if (!data.includes(",!"))
				return [{ err: true, msg: "No plugin metadata found." }];
			let lines = data.split("\n");
			lines.shift();
			lines = lines.filter((line) => line.length > 0);
			for (const line of lines) {
				const comma = line.split(",!");
				const meta = {
					file: comma[0],
					githubRepo: `https://github.com/${comma[1]}`,
					name: comma[2],
					author: comma[3],
					version: comma[4],
					description: comma[5],
					id: comma[6],
				};
				_plugins.push(meta);
			}
			return _plugins;
		},
	},
	uiSounds: {
		enabled: false,
		soundPack: "futuristic.soundpack",
		info: {},
		sounds: {},
		playing: [],
		reload: () => {
			universal.uiSounds.enabled = universal.load("uiSounds") === "true";
			if(!universal.uiSounds.enabled) return;
			universal.uiSounds.soundPack =
				universal.load("soundpack") || "futuristic.soundpack";
			universal.uiSounds.load().then(() => {
				universal.uiSounds.playSound("page_enter");
			});
		},
		load: async () => {
			const res = await fetch(
				`/companion/sounds/${universal.uiSounds.soundPack}/manifest.fdsp.json`,
			).catch((err) => {
				console.error(err);
				universal.sendToast(
					"Failed to load soundpack. Defaulting to futuristic.",
				);
				universal.uiSounds.soundPack = "futuristic.soundpack";
				universal.uiSounds.reload();
			});
			const data = await res.json();
			universal.uiSounds.sounds = data.sounds;
			universal.uiSounds.info = data.info;
			return true;
		},
		playSound: (name) => {
			if (!universal.uiSounds.enabled) return;
			universal.audioClient.play(
				`/companion/sounds/${universal.uiSounds.info.id}/${universal.uiSounds.sounds[name]}`,
				name,
				true,
				false,
				0.5,
			);
		},
	},
	/*  */
	_cb: [],
	keySet: () => {
		for (let i = 0; i < universal.config.iconCountPerPage; i++) {
			const tempDiv = document.createElement("div");
			tempDiv.className = `button k-${i} unset k`;
			universal.keys.appendChild(tempDiv);
		}
		const builtInKeys = [
			{
				name: "Stop All",
				onclick: (ev) => {
					universal.send(
						universal.events.keypress,
						JSON.stringify({ builtIn: true, data: "stop-all" }),
					);
				},
			},
			{
				name: "Reload",
				onclick: (ev) => {
					window.location.reload();
				},
			},
			{
				name: "Settings",
				onclick: (ev) => {},
				handlers: ["onmousedown"],
				onmousedown: UI.quickActions,
			},
		];

		for (const key of builtInKeys) {
			const tempDiv = document.createElement("div");
			tempDiv.className = "button builtin k";
			tempDiv.innerText = key.name;
			tempDiv.onclick = key.onclick;
			if (key.name === "Settings") {
				tempDiv.innerText = "";
				tempDiv.id = "fd-settings-button";
				tempDiv.style.backgroundImage = "url(/companion/icons/fd.png)";
				tempDiv.style.border = "none";
				tempDiv.style.backgroundColor = "transparent";

				const quickAction = document.createElement("div");
				const qa1 = document.createElement("div");
				const qa2 = document.createElement("div");
				const qa3 = document.createElement("div");
				quickAction.id = "qa-container";
				qa1.className = "qa";
				qa2.className = "qa";
				qa3.className = "qa";
				qa1.id = "qa-1";
				qa2.id = "qa-2";
				qa3.id = "qa-3";
				qa1.innerText = "Themes";
				qa2.innerText = "Reload All";
				qa3.innerText = "Settings";
				quickAction.appendChild(qa1);
				quickAction.appendChild(qa2);
				quickAction.appendChild(qa3);
				const handlerDown = (ev) => {
					for (const qa of document.querySelectorAll(".qa")) {
						qa.style.opacity = "1";
					}
				};
				const handlerUp = (ev) => {
					for (const qa of document.querySelectorAll(".qa")) {
						qa.style.opacity = "0";
					}
				};
				quickAction.onmousedown = handlerDown;
				quickAction.onmouseup = handlerUp;
				quickAction.ontouchstart = handlerDown;
				quickAction.ontouchend = handlerUp;
				quickAction.ontouchcancel = handlerUp;
				tempDiv.appendChild(quickAction);
			}
			if (key.handlers) {
				for (const h of key.handlers) {
					tempDiv[h] = key[h];
				}
			}
			universal.keys.appendChild(tempDiv);
		}
	},
	connHelpWizard() {
		const promptEle = document.createElement("div");
		promptEle.className = "prompt";
		const iframe = document.createElement("iframe");
		iframe.src = "/prompt-user-connect.html";
		iframe.frameBorder = "0";
		promptEle.appendChild(iframe);
		document.body.appendChild(promptEle);
	},
	Pages: {},
	reloadProfile: () => {
		universal.config.sounds =
			universal.config.profiles[universal.config.profile];
		for (
			let i = 0;
			i < universal.config.sounds.length / universal.config.iconCountPerPage;
			i++
		) {
			universal.Pages[i] = true;
		}
	},
	listenFor: (ev, cb) => {
		universal._cb.push([ev, cb]);
	},
	sendEvent: (ev, ...data) => {
		for (const cb of universal._cb) {
			if (cb[0] === ev) cb[1](...data);
		}
	},
	/**
	 * Decompresses a Gzip blob
	 * @param {*} blob A Gzip-compressed blob
	 * @param {*} callback A callback function
	 */
	decompressGzipBlob(blob, callback) {
		blob = new Uint8Array(blob);
		const data = Pako.inflate(blob, { to: "string" });
		callback(null, data);
	},
	/**
	 * Async version of decompressGzipBlob
	 * @param {*} blob Gzip-compressed blob
	 * @return {Promise<string>} The decompressed data
	 */
	asyncDecompressGzipBlob(blob) {
		return new Promise((resolve, reject) => {
			universal.decompressGzipBlob(blob, (err, data) => {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		});
	},
	name: "",
	_initFn: (/** @type {string} */ user) =>
		new Promise((resolve, reject) => {
			try {
				universal.CLU("Boot:InitFN", "Starting init function");
				window.universal = universal;
				universal.CLU("Boot:InitFN", "Copied universal to window");
				universal.uiSounds.reload();
				universal.CLU("Boot:InitFN", "Reloaded UI sounds");
				universal._socket = io();
				universal.CLU("Boot:InitFN", "Preflight: connection to socket");
				universal._socket.on("connect", () => {
					universal.CLU("Boot:InitFN", "We're connected to the server!");
					universal.connected = true;
					universal.name = user;
					if (universal.lastRetry !== -1) {
						universal.CLU("Boot:InitFN", "This is a reconnection.");
						universal.sendToast("Reconnected to server.");
						// tell server we're disconnecting
						universal._socket.disconnect();
						window.location.reload();
						return;
					}
					universal.CLU("Boot:InitFN", "Sent Identify packet");
					universal.send("G", user);
					universal.CLU("Boot:InitFN", "Starting dataHandler");
					dataHandler(universal, user).then(() => {
						universal.CLU("Boot:InitFN", "Starting eventsHandler");
						eventsHandler(universal, user).then(() => {
							universal.CLU("Boot:InitFN", "Starting UI");
							resolve(true);
						});
					});
				});
			} catch (e) {
				console.error(e);
				reject(e);
			}
		}),
	sendToast: (message) => {
		if (!HTMLElement.prototype.setHTML) {
			HTMLElement.prototype.setHTML = function (html) {
				this.innerHTML = html;
			};
		}
		if (!document.querySelector("#snackbar")) {
			const snackbar = document.createElement("div");
			snackbar.id = "snackbar";
			document.body.appendChild(snackbar);
		}
		const s = document.createElement("div");
		s.id = "toast";
		s.setHTML(message);
		s.className = "show";
		s.onclick = () => {
			s.className = s.className.replace("show", "");
			s.remove();
		};
		document.querySelector("#snackbar").appendChild(s);

		setTimeout(() => {
			// After 3 seconds, remove the show class from DIV
			s.className = s.className.replace("show", "");
			s.remove();
		}, 3000);
		universal.save(
			"notification_log",
			`${universal.load("notification_log")},${btoa(
				JSON.stringify({
					timestamp: new Date(),
					time: new Date().toTimeString(),
					page: window.location.pathname,
					message,
				}),
			)}`,
		);
	},
	send: (event, value) => {
		universal._socket.emit(event, value);
	},
	on: (event, callback) => {
		universal._socket.on(event, callback);
	},
	once: (event, callback) => {
		universal._socket.once(event, callback);
	},
	log: (data, sender = "Universal") => {
		universal.send(
			universal.events.default.log,
			JSON.stringify({ sender, data }),
		);
		console.log(`[${sender}] ${data}`);
	},
};

export { universal };
window.universal = universal;
window.onerror = (msg, url, linenumber, column, error) => {
	console.log(msg, url, linenumber, column, error);
	alert(`Error message: ${msg}\nURL: ${url}\nLine Number: ${linenumber}`);
	return true;
};
