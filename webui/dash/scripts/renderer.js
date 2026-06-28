import { get, saveToLS } from "./layoutHandler.js";
import { getModParent, hasParentWithTag, mobileCheck } from "./util.js";
import mctx from "/dash/scripts/ctxl2.js";

let layoutDefinition = get();
let DASH_MODE = false;
const MOBILE = mobileCheck();

if (!window["freedeckoverlay"]) {
	document.title = "Freedeck | Dash";
	let cb = null;
	DASH_MODE = true;
	window.freedeckoverlay = {
		dash: true,
		onShortcut: (d) => {
			cb = d;
		},
		setIgnoreEvents: (e) => {},
	};
	window.addEventListener("keydown", (e) => {
		if (e.code == "Backspace" && e.altKey && e.shiftKey) {
			cb(e);
		}
	});
	document.body.classList.add("dash");
	universal.audioClient._no_sinks = true;
}


await universal.init("Overlay", "Freedeck Overlay");
let dragMode = false;
let debugMode = false;
const debugContainer = document.querySelector(".warnings");
const dragWarning = document.querySelector("#dragmode-warning");
const debugWarning = document.querySelector("#debugmode-warning");
const noMods = document.querySelector("#nomods-warning")
if(!DASH_MODE) noMods.textContent = "Your Overlay is empty! Press ALT + SHIFT + BACKSPACE to get started.";
const userViewCollection = [];
const systemViewCollection = ["freedeck", "testing"];
for (const k in universal.plugins) {
	const i = universal.plugins[k];
	if (i.dashModules) {
		for (const n in i.dashModules) {
			userViewCollection.push(n);
		}
	}
}
const selections = {};
for (const i of userViewCollection) {
	fetch("/user-data/dash-modules/" + i + "/module.json")
		.then((res) => {
			return res.json();
		})
		.then((ares) => {
			selections[i] = {
				id: i,
				name: ares.name,
				views: ares.views,
				modules: [],
			};
			for (const viw of ares.views) {
				fetch(`/user-data/dash-modules/${i}/${viw}/module.json`)
					.then((res) => {
						return res.json();
					})
					.then((res) => {
						res.owner = viw;
						selections[i].modules.push(res);
					});
			}
		});
}

for (const i of systemViewCollection) {
	fetch("/dash/modules/" + i + "/module.json")
		.then((res) => {
			return res.json();
		})
		.then((ares) => {
			selections[i] = {
				id: i,
				name: ares.name,
				views: ares.views,
				modules: [],
			};
			for (const viw of ares.views) {
				fetch(`/dash/modules/${i}/${viw}/module.json`)
					.then((res) => {
						return res.json();
					})
					.then((res) => {
            if(res.hidden) return; 
						res.owner = viw;
						selections[i].modules.push(res);
					});
			}
		});
}


universal.audioClient.initialize();
universal.uiSounds.initialize();
freedeckoverlay.onShortcut((e) => {
	dragMode = !dragMode;
	if (dragMode == false) {
		saveToLS();
		universal.uiSounds.playSound("overlay_close");
	} else {
		universal.uiSounds.playSound("overlay_open");
	}
	freedeckoverlay.setIgnoreEvents(!dragMode);
	const target = DASH_MODE ? "#ctxl-view-cont" : "body";
	if (dragMode) {
		document.querySelector(target).style.transitionDuration = ".25s";
		document.querySelector(target).style.animation = "none";
		document.querySelector(target).style.backgroundColor = "rgba(12,12,12,0.5)";
		document.querySelector(target).style.backgroundImage =
			`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;
	} else {
		document.querySelector(target).style.backgroundImage = "";
		document.querySelector(target).style.backgroundColor = "transparent";
	}
	dragWarning.style.display = dragMode ? "block" : "none";
});

const contextMenu = async (e) => {
	e.preventDefault();
	const ctxMenu = document.querySelector(".contextMenu");
	if (ctxMenu && !MOBILE) ctxMenu.remove();
	const custMenu = document.createElement("div");
	custMenu.className = "contextMenu";
	custMenu.style.top = `${e.clientY - window.scrollY}px`;
	custMenu.style.left = `${e.clientX - window.scrollX}px`;
	custMenu.style.position = "absolute";
  custMenu.close = () => {
    custMenu.style.animation = 'close-ctxmenu .1s'
    setTimeout(() => {
      custMenu.remove()
    }, 99);
  }
	if (!hasParentWithTag(e.target)) {
		const menuItem = document.createElement("div");
		menuItem.innerHTML = '<div style="font-weight: bold; margin-bottom: 5px;">Add Module:</div>';
		custMenu.appendChild(menuItem);
		for (const sKey in selections) {
			const sData = selections[sKey];
			const selectionName = sData.name;
			const viewList = sData.modules;
			for (const data of viewList) {
				if(DASH_MODE && !data.view) continue;
				if(!DASH_MODE && !data.overlay) continue;
				const menuItem = document.createElement("div");
				menuItem.innerText = selectionName + " - " + data.name;
				menuItem.className = "menuItem";
				const settingsFix = {};
				for (const settingKey in data.settings) {
					if (!settingsFix[settingKey]) settingsFix[settingKey] = data.settings[settingKey].default;
				}
				menuItem.onclick = () => {
					const uuid = Math.random() * 100;
					layoutDefinition.modules.push({
						[uuid]: {
							uuid,
							type: sData.id + "/" + data.owner,
							renderType: "dash-module",
							settings: settingsFix,
							data: {
								position: {
									x: e.clientX,
									y: e.clientY,
									width: "defined",
									height: "defined",
								},
							},
						},
					});
					saveToLS()
					reloadModules();
          custMenu.close();
				};
				custMenu.appendChild(menuItem);
			}
		}
		const sep = document.createElement("div");
		sep.style = 'font-weight: bold; margin-bottom: 5px;'
		sep.textContent = "Add Tile:"
		custMenu.appendChild(sep);
		let shown = [];
			for (const sKey of universal.config.profiles[universal.config.profile]) {
				const title = Object.keys(sKey)[0];
				const tileData = sKey[title];
				if(shown.includes(tileData.uuid)) {return} else {shown.push(tileData.uuid)}
				const menuItem = document.createElement("div");
				let display = "";
				if (tileData.plugin) {
					display = tileData.plugin;
					for (const i of universal._matchTypeToPlugin
						.keys()
						.filter((e) => e.type == tileData.type)) {
						display += ": " + i.name;
					}
				}
				const italicized = document.createElement("strong");
				italicized.textContent = title + (title.length > 0 ? " - " : "");
				const pluginTitle = document.createElement("span");
				pluginTitle.textContent = (tileData.plugin ? display : "");;
				menuItem.append(italicized, pluginTitle)
				menuItem.className = "menuItem";
				const setupMod = (e) => {
					layoutDefinition.modules.push({
						[title]: {
							uuid: Math.random() * 100,
							type: tileData.type,
							renderType: "dash-button",
							plugin: tileData.plugin,
							data: {
								...tileData.templateData,
								position: {
									x: e.clientX,
									y: e.clientY,
									width: "defined",
									height: "defined",
								},
							},
						},
					});
					saveToLS()
					reloadModules();
					custMenu.close();
				};
				menuItem.addEventListener("touchend", setupMod);
				menuItem.addEventListener("click", setupMod);
				custMenu.appendChild(menuItem);
			}
	} else {
		const p = getModParent(e.target);
		const moduleContext = JSON.parse(p.getAttribute("modulecontext"));
		const layoutData = JSON.parse(p.getAttribute("layout"));
		const settings = JSON.parse(p.getAttribute("settings"));
		const menuItem = document.createElement("div");
		menuItem.innerHTML =
			"<strong>Editing " + moduleContext.name + "</strong>";
		custMenu.appendChild(menuItem);
		const items = [
			{
				text: () => "Remove",
				click: () => {
					layoutDefinition.modules = layoutDefinition.modules.filter((e) => {
						return e[Object.keys(e)[0]].uuid != layoutData.uuid;
					});
					saveToLS()
					reloadModules();
          custMenu.close();
				},
			},
		];
		for (const settingKey in moduleContext.settings) {
			const settingData = moduleContext.settings[settingKey];
			if (settingData.type === "boolean") {
				settingData.type = "select";
				settingData.options = { true: "On", false: "Off" };
			}
			if (!settings[settingKey]) settings[settingKey] = settingData.default;
			if (settingData.type === "select") {
				const opts = settingData.options;
				const itm = {
					text: () => {
						return settingData.title + ": " + opts[settings[settingKey]];
					},
					click: (e) => {
						const k = Object.keys(opts);
						let idx = k.indexOf(settings[settingKey]);
						if (++idx >= k.length) idx = 0;
						settings[settingKey] = k[idx];
						p.setAttribute("settings", JSON.stringify(settings));
						if (p.overlaySettingsChanged) {
							p.overlaySettingsChanged(settings);
							itm.text = () =>
								settingData.title + ": " + opts[settings[settingKey]];
						}
						e.srcElement.innerHTML = itm.text();
						layoutDefinition.modules.forEach((mod) => {
							const modKey = Object.keys(mod)[0];
							if (mod[modKey].uuid[0] === layoutData.uuid[0]) {
								mod[modKey].settings = settings;
							}
						});
						saveToLS()
					},
				};
				items.push(itm);
			}
		}
		for (const t of items) {
			const menuItem2 = document.createElement("div");
			menuItem2.innerHTML = t.text();
			menuItem2.onclick = t.click;
			menuItem2.className = "menuItem";
			custMenu.appendChild(menuItem2);
		}
	}
	custMenu.addEventListener(
		"click",
		(e) => {
			e.stopPropagation();
		},
		{ passive: false },
	);

	custMenu.addEventListener(
		"touchstart",
		(e) => {
			e.stopPropagation();
		},
		{ passive: false },
	);

	custMenu.addEventListener(
		"touchend",
		(e) => {
			e.stopPropagation();
		},
		{ passive: false },
	);
	document.body.appendChild(custMenu);
};

window.addEventListener("contextmenu", contextMenu);
if (!MOBILE) {
	window.addEventListener("click", (e) => {
		if (e.srcElement.className !== "contextMenu") {
			const contextMenu = document.querySelector(".contextMenu");
			if (contextMenu) contextMenu.remove();
		}
		universal.uiSounds.playSound("click");
	});
} else {
	let touchTimer;

	window.addEventListener("touchstart", (e) => {
		const touch = e.touches[0];

		if (e.target.className !== "contextMenu") {
			const existingMenu = document.querySelector(".contextMenu");
			if (existingMenu) existingMenu.remove();
		}

		touchTimer = setTimeout(() => {
			const touchData = {
				clientX: touch.clientX,
				clientY: touch.clientY,
				target: e.target,
				preventDefault: () => e.preventDefault(),
			};

			contextMenu(touchData);
		}, 500);
	});

	window.addEventListener("touchend", () => {
		clearTimeout(touchTimer);
	});

	window.addEventListener("touchmove", () => {
		clearTimeout(touchTimer);
	});
}
// window.addEventListener("onclick", contextMenu)

window.addEventListener("keydown", async (e) => {
	if (e.key === "f") debugMode = !debugMode;
	if (e.key === "r") reloadModules();

	debugWarning.style.display = debugMode ? "block" : "none";

	if (debugMode) {
		document.querySelectorAll(".debug-only").forEach((enrty) => {
			enrty.style.display = "block";
		});
	} else {
		document.querySelectorAll(".debug-only").forEach((enrty) => {
			enrty.style.display = "none";
		});
	}
});
reloadModules();

function reloadModules() {
  if(layoutDefinition.modules.length < 1) {
    noMods.style.display = 'block'
  } else {
    noMods.style.display = 'none'
  }
	document.querySelectorAll(".debug-only").forEach((enrty) => {
		enrty.remove();
	});
  for (const i of mctx.opened) {
		mctx.closeView(i);
	}
	document.querySelectorAll(".dash-button").forEach((e) => e.remove());
	for (const module of layoutDefinition.modules) {
		const name = Object.keys(module)[0];
		const trueData = module[name];
		if (trueData.renderType == "dash-module") renderModule(trueData, name);
		if (trueData.renderType == "dash-button") {
			const view = document.createElement("button");
			const div = document.createElement("div");
			div.classList.add("button-text");
			const p = document.createElement("p");
			div.appendChild(p);
			view.appendChild(div);
			p.innerText = name;
			let display = name;
			if (trueData.plugin) {
				for (const i of universal._matchTypeToPlugin
					.keys()
					.filter((e) => e.type == trueData.type)) {
					display = i.name;
				}
			}
			setupElement(view, trueData, { name: display });
			view.classList.remove("dash-module");
			view.classList.add("dash-button");
			view.classList.add("button");
			view.setAttribute("data-interaction", JSON.stringify(trueData));
			view.addEventListener("click", (event) => {
				if (!dragMode) {
					universal.send(universal.events.keypress, {
						event,
						btn: trueData,
					});
					return;
				}
			});
			const styleChanges = {};
			for (const iconName in universal.iconRegistry) {
				const icon = universal.iconRegistry[iconName];
				if (icon.types?.includes(trueData.type)) {
					view.style.backgroundImage = `url("/user-data/icon-registry/${icon.identifier}.${icon.img.split(".").at(-1)}")`;
				}
			}
			view.addEventListener("mouseenter", (event) => {
				if (!dragMode) freedeckoverlay.setIgnoreEvents(false);
			});
			view.addEventListener("mouseleave", (event) => {
				if (!dragMode) freedeckoverlay.setIgnoreEvents(true);
			});
			document.body.appendChild(view);
		}
	}
}

async function renderModule(
	trueData,
	name,
	prefix = "/user-data/dash-modules/",
) {
	let modFound = false;
	trueData.from = prefix;
	await fetch(prefix + trueData.type + "/module.json")
		.then((res) => {
			modFound = true;
			trueData.from = prefix + trueData.type + "/module.json";
			return res.json();
		})
		.then((res) => {
			if (res.view && DASH_MODE) res.overlay = res.view;
			if (!res.overlay && res.view) res.overlay = res.view;
			mctx.addView(`${prefix}${trueData.type}/${res.overlay}`);
			const view = mctx.nonDestructiveView(
				`${prefix}${trueData.type}/${res.overlay}`,
			);
			setupElement(view, trueData, res);
		})
		.catch((e) => {
			if (prefix === "/user-data/dash-modules/") {
				renderModule(trueData, name, "/dash/modules/");
			} else {
				trueData.settings["_fd_error"] = trueData.type;
				trueData.type = "freedeck/couldnt-add";
				renderModule(trueData, "freedeck/couldnt-add", "/dash/modules/");
				universal.sendToast(`Failed to add ${name}`, "Dash");
			}
		});
}

function setupElement(view, trueData, res, name) {
	view.setAttribute("layout", JSON.stringify(trueData));
	view.setAttribute("settings", JSON.stringify(trueData.settings || {}));
	view.setAttribute("modulecontext", JSON.stringify(res));
	view.style.position = "absolute";
	view.style.top = trueData.data.position.y + "px";
	view.style.left = trueData.data.position.x + "px";
	view.classList.add("dash-module");
	view.style.overflow = "hidden";
	if (trueData.data.position.width !== "defined") {
		view.style.width = trueData.data.position.width + "px";
	} else {
		view.style.width = "min-content";
	}
	if (trueData.data.position.height !== "defined") {
		view.style.height = trueData.data.position.height + "px";
	} else {
		view.style.height = "min-content";
	}
	let isDragging = false;
	let startX = 0;
	let startY = 0;
	view.addEventListener("mousedown", (event) => {
		event.stopPropagation();
		if (event.button == 2) return;
		if (!dragMode) return;
		isDragging = true;
		view.classList.add("dragging");
		startX = event.clientX - view.offsetLeft;
		startY = event.clientY - view.offsetTop;
		event.preventDefault();
	});
	const handleMouseUp = (event) => {
		if (isDragging) {
			isDragging = false;
			view.classList.remove("dragging");
		}
	};

	const dataTxt = document.createElement("span");
	dataTxt.classList.add("debug-only");
	const handleMouseMove = (event) => {
		dataTxt.innerText = `${name}, ${JSON.stringify(trueData)}, (${view.style.top} ${view.style.left} ${view.style.width} ${view.style.height})`;
		if (isDragging) {
			const newX = event.clientX - startX;
			const newY = event.clientY - startY;

			// Keep within viewport bounds
			const maxX = window.innerWidth - view.offsetWidth;
			const maxY = window.innerHeight - view.offsetHeight;

			view.style.left = Math.max(0, Math.min(newX, maxX)) + "px";
			view.style.top = Math.max(0, Math.min(newY, maxY)) + "px";
			trueData.data.position.y = Math.max(0, Math.min(newY, maxY));
			trueData.data.position.x = Math.max(0, Math.min(newX, maxX));
		}
	};
	debugContainer.prepend(dataTxt);

	// Add event listeners
	document.addEventListener("mousemove", handleMouseMove);
	document.addEventListener("mouseup", handleMouseUp);
}
