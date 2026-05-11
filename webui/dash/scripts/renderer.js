let layoutDefinition = {
	id: "8499f778-de42-4d8c-b07b-9e5ed06d3d90",
	name: "Overlay Layout",
	modules: [
		{
			beta: {
				uuid: "01",
				type: "freedeck/beta",
				renderType: "dash-module",
				data: {
					position: {
						x: "0",
						y: "0",
						width: "defined",
						height: "defined",
					},
				},
			},
		},
	],
};

let DASH_MODE = false;
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

if (!localStorage.getItem("freedeck:overlay")) {
	localStorage.setItem("freedeck:overlay", JSON.stringify(layoutDefinition));
} else {
	layoutDefinition = JSON.parse(localStorage.getItem("freedeck:overlay"));
}
import mctx from "/dash/ctxl2.js";
window.mctx = mctx;
await universal.init("Overlay", "Freedeck Overlay");
let dragMode = false;
let debugMode = false;
const debugContainer = document.querySelector(".warnings");
const dragWarning = document.querySelector("#dragmode-warning");
const debugWarning = document.querySelector("#debugmode-warning");
const noMods = document.querySelector("#nomods-warning")
const userViewCollection = [];
const systemViewCollection = ["freedeck"];
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
						res.owner = viw;
						selections[i].modules.push(res);
					});
			}
		});
}

function hasAndIs(element, tag, is) {
	return (
		element.classList &&
		element.classList.contains(is) &&
		element.tagName.toLowerCase() == tag.toLowerCase()
	);
}
function isModule(currentElement) {
	return (
		hasAndIs(currentElement, "button", "dash-button") ||
		hasAndIs(currentElement, "html", "dash-module")
	);
}

function hasParentWithTag(element) {
	let currentElement = element;
	if (isModule(currentElement)) return true;
	while (currentElement.parentNode) {
		currentElement = currentElement.parentNode;
		if (isModule(currentElement)) return true;
	}
	return false;
}

function getModParent(element) {
	let currentElement = element;
	if (isModule(currentElement)) return currentElement;
	while (currentElement.parentNode) {
		currentElement = currentElement.parentNode;
		if (isModule(currentElement)) return currentElement;
	}
	return null;
}

universal.audioClient.initialize();
universal.uiSounds.initialize();
freedeckoverlay.onShortcut((e) => {
	dragMode = !dragMode;
	if (dragMode == false) {
		localStorage.setItem("freedeck:overlay", JSON.stringify(layoutDefinition));
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
		menuItem.innerHTML = "<strong>Add module:</strong>";
		custMenu.appendChild(menuItem);
		for (const sKey in selections) {
			const sData = selections[sKey];
			const selectionName = sData.name;
			const viewList = sData.modules;
			for (const data of viewList) {
				const menuItem = document.createElement("div");
				menuItem.innerText = selectionName + " - " + data.name;
				menuItem.className = "menuItem";
				const settingsFix = {};
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
					reloadModules();
          custMenu.close();
				};
				custMenu.appendChild(menuItem);
			}

			for (const sKey of universal.config.profiles[universal.config.profile]) {
				const title = Object.keys(sKey)[0];
				const tileData = sKey[title];
				const menuItem = document.createElement("div");
				let display = "";
				if (tileData.plugin) {
					display = " - " + tileData.plugin;
					for (const i of universal._matchTypeToPlugin
						.keys()
						.filter((e) => e.type == tileData.type)) {
						display += ": " + i.name;
					}
				}
				menuItem.innerText = title + (tileData.plugin ? display : "");
				menuItem.className = "menuItem";
				const setupMod = (e) => {
					layoutDefinition.modules.push({
						[title]: {
							uuid: [Math.random() * 100],
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
					reloadModules();
				};
				menuItem.addEventListener("touchend", setupMod);
				menuItem.addEventListener("click", setupMod);
				// custMenu.appendChild(menuItem);
			}
		}
	} else {
		const p = getModParent(e.target);
		const moduleContext = JSON.parse(p.getAttribute("modulecontext"));
		const layoutData = JSON.parse(p.getAttribute("layout"));
		const settings = JSON.parse(p.getAttribute("settings"));
		const menuItem = document.createElement("div");
		menuItem.innerHTML =
			"<strong>Selected: " + moduleContext.name + "</strong>";
		custMenu.appendChild(menuItem);
		const items = [
			{
				text: () => "Remove",
				click: () => {
					layoutDefinition.modules = layoutDefinition.modules.filter((e) => {
						return e[Object.keys(e)[0]].uuid != layoutData.uuid;
					});
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
						localStorage.setItem(
							"freedeck:overlay",
							JSON.stringify(layoutDefinition),
						);
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
  console.log(layoutDefinition)
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

window.mobileCheck = function () {
	let check = false;
	(function (a) {
		if (
			/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
				a,
			) ||
			/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
				a.substr(0, 4),
			)
		)
			check = true;
	})(navigator.userAgent || navigator.vendor || window.opera);
	return check;
};
const MOBILE = window.mobileCheck();

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
	if (e.key === "k") {
		localStorage.setItem(
			"freedeck:overlay",
			JSON.stringify({
				id: "8499f778-de42-4d8c-b07b-9e5ed06d3d90",
				name: "Overlay Layout",
				modules: [
					{
						beta: {
							uuid: "01",
							type: "beta",
							renderType: "dash-module",
							data: {
								position: {
									x: "0",
									y: "0",
									width: "defined",
									height: "defined",
								},
							},
						},
					},
				],
			}),
		);
		window.reload();
	}

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
