import Pako from "pako";
import { compareVersions } from "compare-versions";
import repositoryManager from "./repositoryManager";
import dataHandler from "./init/data";
import eventsHandler from "./init/events";
import { UI } from "../client/scripts/ui";
import audioEngine from "./audioEngine";
import themeEngine from "./themeEngine";
import uiSounds from "./uiSounds";
import {
	doLocalization,
	translatePage,
	translateElement,
	translationKey,
} from "./localization";

window._OldFetch = window.fetch;
window.fetch = async (url, options) => {
	url = `${universal.relay}${url}`;
	return window._OldFetch(url, options);
};

const universal = {
	compareVersions,
	relay: "",
	_socket: null,
	lastRetry: -1,
	connected: false,
	reconnect: () => {
		universal.connected = false;
		universal.lastRetry = new Date();
		universal._socket.connect();
	},
	wakeLock: {
		sentinel: null,
		request: async () => {
			if ("wakeLock" in navigator) {
				try {
					universal.wakeLock.sentinel =
						await navigator.wakeLock.request("screen");
					universal.CLU("Boot / WakeLock", "Wake lock acquired.");
				} catch (err) {
					console.error(`${err.name}, ${err.message}`);
					universal.sendToast("Failed to acquire wake lock.", "Freedeck");
				}
			}
		},
	},
	getServerFlags: () => universal._information.style || { compact: false },
	_information: {},
	_init: false,
	_authStatus: false,
	_matchTypeToPlugin: new Map(),
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
		return localStorage.setItem(universal.storage.prefix(k), v);
	},
	load: (k) => {
		if (localStorage.getItem(btoa(`fd.${k}`))) {
			const i = localStorage.getItem(btoa(`fd.${k}`));
			localStorage.removeItem(btoa(`fd.${k}`));
			universal.CLU("Storage", `Migrated ${k} to new storage format.`);
			universal.save(k, atob(i));
		}
		const exists = localStorage.getItem(universal.storage.prefix(k));
		return exists ? exists : null;
	},
	remove: (k) => {
		return localStorage.removeItem(universal.storage.prefix(k));
	},
	exists: (k) => {
		return localStorage.getItem(universal.storage.prefix(k)) != null;
	},
	default: (k, v) => {
		universal.CLU("Default", `Setting ${k} to ${v}`);
		return universal.exists(k) ? universal.load(k) : universal.save(k, v);
	},
	loadObject: (k, d = {}) => {
		try {
			return JSON.parse(universal.load(k)) || d;
		} catch (e) {
			console.error("Error while loading object", k, e);
			return d;
		}
	},
	saveObject: (k, v) => {
		return universal.save(k, JSON.stringify(v));
	},
	flags: {
		_cache: {},
		reload: () => {
			universal.flags._cache = universal.loadObject("flags") || {};
		},
		isEnabled: (flag) => {
			return universal.flags._cache[flag] === "true";
		},
		set: (flag, value) => {
			universal.flags._cache[flag] = value;
			universal.save("flags", JSON.stringify(universal.flags._cache));
		},
		toggle: (flag) => {
			universal.flags._cache[flag] =
				universal.flags._cache[flag] === "true" ? "false" : "true";
			universal.save("flags", JSON.stringify(universal.flags._cache));
		},
	},
	storage: {
		prefix: (k) => `freedeck:${k}`,
		keys: () => {
			const _keys = [];
			for (const key of Object.keys(localStorage)) {
				_keys.push(key);
			}
			return _keys;
		},
		reset: () => {
			for (const key of Object.keys(localStorage)) {
				localStorage.removeItem(key);
				location.reload();
			}
		},
	},
	waitForElement: (selector, callback) => {
		const elem = document.querySelector(selector);
		if (elem) {
			callback(elem);
		} else {
			const observer = new MutationObserver((mutations) => {
				if (document.querySelector(selector)) {
					observer.disconnect();
					callback(document.querySelector(selector));
				}
			});
			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}
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
			select.onchange = (ev) => {
				universal.uiSounds.playSound("step_2");
				eventHandler(ev);
			};
			return container;
		},
	},
	audioClient: audioEngine,
	login: (passwd) => {
		universal.send(
			universal.events.login.login_data,
			universal._information.tempLoginID,
		);
		universal.send(universal.events.login.login, { passwd });
	},
	theming: themeEngine,
	themes: [] /* Theme list */,
	imported_scripts: [],
	import: (script) => {
		universal.imported_scripts.push(script);
		const scriptElement = document.createElement("script");
		scriptElement.src = script;
		scriptElement.id = script.split("/").pop().split(".").shift();
		document.body.appendChild(scriptElement);
	},
	ExportReportData: () => {
		const exportTimeStart = Date.now();
		const universalState = {};
		Object.assign(universalState, universal);
		universalState._socket = {
			connected: universal._socket.connected,
			uri: universal._socket.io.uri,
		};
		universalState.keys = "DOM Element";
		const erd = {
			time: Date.now(),
			currentPage: window.location.pathname,
			universalState,
			localStorage,
			notificationLog: universal.getServerFlags()[
				"app.freedeck.notification_log"
			]
				? universal.loadObject("logs/notif", [])
				: "Notification log disabled.",
			localConfiguration: universal.getServerFlags(),
			bootLog: universal._verify(universal.CLUL),
			errorLog: universal._verify(universal.ErrorLog),
			exportTimeStart,
		};
		const exportTimeEnd = Date.now();
		erd.exportTimeEnd = exportTimeEnd;
		erd.exportTimeElapsed = exportTimeEnd - exportTimeStart;
		return JSON.stringify(erd);
	},
	_verify: (object) => {
		if (object.length > 0) return object;
		return "Empty";
	},
	CL: true,
	CLUL: [["Universal loaded", Date.now()]],
	showBootLog: UI.showBootLog,
	CLU: (s, ...m) => {
		universal.CL ? console.log(`${s}:`, ...m) : null;
		const elem = document.createElement("code");
		elem.innerText = `${s}: ${m}\n`;
		universal.CLUL.push([elem.innerText, Date.now()]);
		document.querySelector("#boot-log").appendChild(elem);
	},
	doInitialize: (fn, systemData, ...args) => {
		try {
			universal.CLU(
				`Systems/${systemData.name}`,
				`Initializing ${systemData.name}...`,
			);
			fn(...args);
			universal.CLU(
				`Systems/${systemData.name}`,
				`Initialized ${systemData.name}!`,
			);
		} catch (e) {
			universal.CLU(
				`Systems/${systemData.name}`,
				`Error while initializing system: ${e}`,
			);
		}
	},
	init: (user, splash = "Freedeck") => {
		return new Promise((resolve, reject) => {
			UI.makeBootLog(splash);
			(async () => {
				const stateFetch = await fetch("/api/discover");
				const state = await stateFetch.json();
				if (state.webpackStatus !== "ready") {
					window.location.href = `/new-connect.html?id=${user}`;
				}
				universal.CLU("Boot", "Boot log created");
				window.universal = universal;
				universal.CLU("InitFN", "Copied universal to window");
				doLocalization();
				universal.CLU("Boot", "Localization initialized");
				try {
					universal.CLU("Boot", "Pre-init");
					universal.CLU("InitFN", "Starting init function");
					universal._socket = io();
					universal.CLU("InitFN", "Preflight: connection to socket");
					universal._socket.on("connect", async () => {
						universal.CLU("InitFN", "We're connected to the server!");
						universal.connected = true;
						universal.name = user;
						if (universal.lastRetry !== -1) {
							universal.CLU("InitFN", "This is a reconnection.");
							universal._socket.disconnect();
							window.location.reload();
							return;
						}
						universal.listenForOnce("data_ready", async () => {
							universal.CLU("InitFN", "Starting eventsHandler");
							await eventsHandler(universal, user);
							if (universal.name == "Main") {
								universal.CLU(
									"InitFN / WakeLock",
									"Attempting to grab wake lock.",
								);
								universal.wakeLock.request();
							}
							universal.CLU("InitFN", "Boot completed.");
							universal.CLU(
								"Boot",
								`Received full configuration (${
									Object.keys(universal.config).length
								} objects translated from ${
									Object.keys(universal._information).length
								})`,
							);
							universal.CLU("Boot", "Running post-init tasks");
							universal.doInitialize(
								universal.theming.initialize,
								{ name: "Theme Engine" },
								universal,
							);
							universal.doInitialize(UI.initialize, { name: "UI" }, universal);
							if (universal.name === "Companion") {
								universal.doInitialize(
									universal.audioClient.initialize,
									{ name: "Audio Engine" },
									universal,
								);
								universal.doInitialize(
									universal.uiSounds.initialize,
									{ name: "UI Sounds" },
									universal,
								);
							}
							universal.CLU(
								"Boot",
								"Platform specific post-init tasks completed.",
							);
							universal.sendEvent("launch");
							universal.CLU("Boot", "Sent 'launch' event");
							await UI.closeBootLog();
							universal.CLU("Boot", "Launching -- closing splash screen.");
							if (universal.load("locale") !== "en") {
								universal.sendToast(
									translationKey("warnings.language"),
									"Freedeck",
								);
								universal.CLU("Boot", "User is using a non-default language.");
							}
							resolve();
						});
						universal.CLU("InitFN", "Starting dataHandler");
						await dataHandler(universal, user);
					});
				} catch (e) {
					universal.CLU("Boot", `Error while running init: ${e}`);
					universal.sendToast(
						"Failed to initialize Freedeck. Please try again.",
						"Error",
					);
					reject(e);
				}
			})();
		});
	},
	/* repos */
	repositoryManager,
	uiSounds,
	/*  */
	_cb: new Map(),

	setPage(page) {
		const lastPage = universal.page;
		const direction = lastPage > page ? "right" : "left";
		universal.page = page;
		universal.save("page", universal.page);
		UI.reloadTiles();
		universal.sendEvent("page_change");
		universal.sendEvent("animate_page", "automated", direction);
	},
	incrementPage() {
		if (UI.Pages[universal.page + 1]) universal.setPage(universal.page + 1);
	},
	decrementPage() {
		if (UI.Pages[universal.page - 1]) universal.setPage(universal.page - 1);
	},
	keySet: () => {
		const isCentered = false;
		universal.keys.innerHTML = "";
		for (let i = 0; i < universal.config.iconCountPerPage; i++) {
			const tempDiv = document.createElement("div");
			tempDiv.className = `button k-${i} unset k ${
				isCentered ? "tiles-center" : ""
			}`;
			universal.keys.appendChild(tempDiv);
		}

		if (universal.getServerFlags()["app.freedeck.no_preset_tiles"]) return;

		const logoButton = document.createElement("div");
		logoButton.id = "fd-settings-button";
		logoButton.style.backgroundImage = "url(/assets/logo_big.png)";

		logoButton.style.border = "none";
		logoButton.style.backgroundColor = "transparent";
		logoButton.style.boxShadow = "none";
		UI.handleActionButton(logoButton);
		logoButton.className = `button builtin k ${isCentered ? "tiles-center" : ""}`;
		universal.keys.appendChild(logoButton);
	},
	connHelpWizard() {
		return new Promise((resolve, reject) => {
			universal.listenFor("finish_conn", resolve);
			universal.vopen("setup_04_device");
		});
	},
	Pages: {},
	reloadProfile: () => {
		universal.app_tiles = universal.config.profiles[universal.config.profile];
		for (
			let i = 0;
			i < universal.app_tiles.length / universal.config.iconCountPerPage;
			i++
		) {
			universal.Pages[i] = true;
		}
	},
	listenFor: (ev, cb) => {
		universal._cb.set(ev, cb);
	},
	listenForOnce: (ev, cb) => {
		const fn = (...args) => {
			cb(...args);
			universal._cb.delete(ev);
		};
		universal._cb.set(ev, fn);
	},
	sendEvent: (ev, ...data) => {
		universal._cb.forEach((callback, event) => {
			if (event == ev) callback(...data);
		});
	},
	/**
	 * Decompresses a Gzip blob
	 * @param {*} blob A Gzip-compressed blob
	 * @param {*} callback A callback function
	 */
	decompressGzipBlob(blob, callback) {
		const data = Pako.inflate(new Uint8Array(blob), { to: "string" });
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
	_timeouts: {},
	sendToast: (message, sender = "") => {
		if (!universal.getServerFlags()["app.freedeck.ui.show_notifications"])
			return;
		if (!HTMLElement.prototype.setHTML) {
			HTMLElement.prototype.setHTML = function (html) {
				this.innerHTML = universal.cleanHTML(html);
			};
		}
		if (!document.querySelector("#snackbar")) {
			const snackbar = document.createElement("div");
			snackbar.id = "snackbar";
			document.body.appendChild(snackbar);
		}
		const base64Identifier = btoa(message + sender);
		if (document.querySelector(`div[data-id="${base64Identifier}"]`)) {
			const elem = document.querySelector(`div[data-id="${base64Identifier}"]`);
			const count = Number.parseInt(elem.getAttribute("data-count"));
			elem.setAttribute("data-count", count + 1);
			elem.setHTML(`<h3>${sender}</h3>${message} (x${count + 1})`);
			clearTimeout(universal._timeouts[elem.id]);
			const id = elem.id;
			const to = setTimeout(() => {
				elem.className = elem.className.replace("show", "hide");
				setTimeout(() => {
					elem.remove();
				}, 500);
			}, 3000);
			universal._timeouts[id] = to;
			if (universal.name != "Overlay")
				universal.uiSounds.playSound("notification");
			return;
		}
		const s = document.createElement("div");
		s.setAttribute("data-id", base64Identifier);
		s.setAttribute("data-count", 1);
		const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
		s.id = id;
		s.setHTML(`<h3>${sender}</h3>${message}`);
		s.classList.add("toast");
		s.classList.add("show");
		s.onclick = () => {
			s.className = s.className.replace("show", "");
			s.remove();
		};
		if (universal.name != "Overlay")
			universal.uiSounds.playSound("notification");
		document.querySelector("#snackbar").appendChild(s);

		const to = setTimeout(() => {
			s.className = s.className.replace("show", "hide");
			setTimeout(() => {
				s.remove();
			}, 500);
		}, 3000);
		universal._timeouts[id] = to;
		const logIn = {
			t: Date.now(),
			p: window.location.pathname,
			m: message,
			ov: universal.ctx?.opened,
		};
		const logNotif = universal.loadObject("logs/notif");
		const logEnabled =
			universal.getServerFlags()["app.freedeck.notification_log"];
		if (logNotif.length > 0 && !logEnabled)
			universal.saveObject("logs/notif", []);
		else {
			if (logNotif.length > 128) universal.saveObject("logs/notif", []);
			if (logEnabled) {
				const log = universal.loadObject("logs/notif");
				log.push(logIn);
				universal.saveObject("logs/notif", log);
			}
		}
	},
	send: (event, value) => {
		if (universal._socket.connected) universal._socket.emit(event, value);
	},
	on: (event, callback) => {
		universal._socket.on(event, callback);
	},
	once: (event, callback) => {
		universal._socket.once(event, callback);
	},
	ErrorLog: [],
	createTooltipFor: (element, html) => {
		const tooltip = document.createElement("div");
		tooltip.className = "tooltip";
		tooltip.innerHTML = html;
		document.body.appendChild(tooltip);
		element.onmouseleave = () => {
			tooltip.classList.remove("show");
		};
		element.onmouseenter = () => {
			tooltip.classList.add("show");
		};
		element.onmousemove = (ev) => {
			const tooltipWidth = tooltip.offsetWidth;
			const tooltipHeight = tooltip.offsetHeight;

			const mouseX = ev.clientX;
			const mouseY = ev.clientY;

			if (mouseX + tooltipWidth > window.innerWidth) {
				tooltip.style.left = `${mouseX - tooltipWidth}px`;
			} else {
				tooltip.style.left = `${mouseX}px`;
			}

			if (mouseY + tooltipHeight > window.innerHeight) {
				tooltip.style.top = `${mouseY - tooltipHeight}px`;
			} else {
				tooltip.style.top = `${mouseY}px`;
			}
		};
		return tooltip;
	},
	/**
	 * Sanitize an HTML string
	 * (c) Chris Ferdinandi, MIT License, https://gomakethings.com
	 * @param  {String}          str   The HTML string to sanitize
	 * @param  {Boolean}         nodes If true, returns HTML nodes instead of a string
	 * @return {String|NodeList}       The sanitized string or nodes
	 */
	cleanHTML(str, nodes) {
		/**
		 * Convert the string to an HTML document
		 * @return {Node} An HTML document
		 */
		function stringToHTML() {
			const parser = new DOMParser();
			const doc = parser.parseFromString(str, "text/html");
			return doc.body || document.createElement("body");
		}

		/**
		 * Remove <script> elements
		 * @param  {Node} html The HTML
		 */
		function removeScripts(html) {
			const scripts = html.querySelectorAll("script");
			for (const script of scripts) {
				script.remove();
			}
		}

		/**
		 * Check if the attribute is potentially dangerous
		 * @param  {String}  name  The attribute name
		 * @param  {String}  value The attribute value
		 * @return {Boolean}       If true, the attribute is potentially dangerous
		 */
		function isPossiblyDangerous(name, value) {
			const val = value.replace(/\s+/g, "").toLowerCase();
			if (["src", "href", "xlink:href"].includes(name)) {
				if (val.includes("javascript:") || val.includes("data:")) return true;
			}
			if (name.startsWith("on")) return true;
		}

		/**
		 * Remove potentially dangerous attributes from an element
		 * @param  {Node} elem The element
		 */
		function removeAttributes(elem) {
			// Loop through each attribute
			// If it's dangerous, remove it
			const atts = elem.attributes;
			for (const { name, value } of atts) {
				if (!isPossiblyDangerous(name, value)) continue;
				elem.removeAttribute(name);
			}
		}

		/**
		 * Remove dangerous stuff from the HTML document's nodes
		 * @param  {Node} html The HTML document
		 */
		function clean(html) {
			const nodes = html.children;
			for (const node of nodes) {
				removeAttributes(node);
				clean(node);
			}
		}

		// Convert the string to HTML
		const html = stringToHTML();

		// Sanitize it
		removeScripts(html);
		clean(html);

		// If the user wants HTML nodes back, return them
		// Otherwise, pass a sanitized string back
		return nodes ? html.childNodes : html.innerHTML;
	},
	translatePage,
	translateElement,
	translationKey,
};

export { universal };
window.universal = universal;

window.ErrorIgnore = () => {
	document.querySelector("#error-dialog").remove();
	document.querySelector("#keys").style.display = "grid";
	if (window.location.href.includes("companion")) {
		document.querySelector(".sidebar").style.display = "flex";
	}
};
if (!universal.UI) universal.UI = UI;

window.addEventListener("keydown", (e) => {
	if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") {
		e.preventDefault();

		UI.showBootLog(false);
		setTimeout(() => {
			window.location.reload();
		}, 500);
	}
});

universal.listenFor(
	"animate_page",
	(type = "automated", direction = "left") => {
		// if (!universal.getServerFlags()['app.freedeck.animate_page_changes']) return;
		// const keys = document.getElementById("keys");
		// if (type === "automated") {
		//   keys.style.animation = `pull-${direction} 0.5s`;
		// }
	},
);

if (!HTMLElement.prototype.setHTML) {
	HTMLElement.prototype.setHTML = function (html) {
		this.innerHTML = html;
	};
}

const loginDialog = document.querySelector("#login-dialog");
const loginDiv = document.querySelector("#login-div");
const loginMsg = document.querySelector("#login-msg");
const passwd = document.querySelector("#password");

universal.listenFor("authpage", () => {
	universal.on(universal.events.login.login, (dat) => {
		if (dat === true) {
			if (passwd && passwd.value !== "") {
				universal.save("password", passwd.value);
			}
			universal.save("logintime", Date.now());
			loginDiv.style.opacity = "0";
			loginDialog.style.opacity = "0";
			setTimeout(() => {
				loginDialog.remove();
			}, 250);
			universal.send(universal.events.client_greet, universal._user);
		} else {
			loginMsg.setHTML("Password incorrect.");
			loginDialog.style.display = "flex";
			loginDiv.style.opacity = "1";
			loginDialog.style.opacity = "1";
		}
	});

	if (universal.load("password")) {
		universal.login(universal.load("password"));
	} else {
		loginDialog.style.display = "flex";
		loginDialog.style.opacity = "1";
		loginDiv.style.opacity = "1";
	}
});
