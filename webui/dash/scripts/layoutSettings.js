const btn = document.querySelector("#layout-settings")
const settingsMenuContainer = document.querySelector(".settings-menu")
function setupSettingsMenu() {
  btn.addEventListener('click', () => {
    if(settingsMenuContainer.style.display =='flex') {
      hideLS();
    } else {
      showLS();
    }
  })
}
import { getModParent } from "./util.js";
import { get, saveToLS } from "./layoutHandler.js";

function showLS() {
  const curroverlay = universal.loadObject("overlay", {})
  const items = [];
  settingsMenuContainer.innerHTML = '';
  const title = document.createElement('h1');
  title.innerText = universal.translationKey('dash.settings');
  settingsMenuContainer.appendChild(title);
  for(const i of curroverlay.modules) {
    const placedMod = i[Object.keys(i)[0]];
    console.log(placedMod.settings)
    const ownerModule = Object.values(universal.uvc).find(k => k.id===placedMod.type.split("/")[0]);
    const view = ownerModule.modules.find(mod=>mod.owner==placedMod.type.split("/")[1]);
    const p = document.querySelector('html[ctxl-id="/user-data/dash-modules/'+placedMod.type+'/view"]')
		const layoutData = JSON.parse(p.getAttribute("layout"));
		const settings = JSON.parse(p.getAttribute("settings"));
    items.push({text:()=>universal.translationKey('dash.settings.viewtitle').replace('$1',view.name).replace('$2', ownerModule.name),title:true})
    for (const settingKey in view.settings) {
			const settingData = view.settings[settingKey];
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
						get().modules.forEach((mod) => {
							const modKey = Object.keys(mod)[0];
							if (mod[modKey].uuid[0] === layoutData.uuid[0]) {
								mod[modKey].settings = settings;
							}
						});
						saveToLS();
					},
				};
				items.push(itm);
			}
		}
    
  }
  for (const t of items) {
    if(t.title) {
      const menuItem2 = document.createElement("h2");
      menuItem2.innerHTML = t.text();
      menuItem2.className = "menuItem donthover";
      settingsMenuContainer.appendChild(menuItem2);
    } else {
      const menuItem2 = document.createElement("div");
      menuItem2.innerHTML = t.text();
      menuItem2.onclick = t.click;
      menuItem2.className = "menuItem";
      settingsMenuContainer.appendChild(menuItem2);
    }
  }
  settingsMenuContainer.style.display='flex'
		setTimeout(() => {
			settingsMenuContainer.style.right = "0";
			settingsMenuContainer.style.opacity = "1";
		}, 20);
}

function hideLS() {
  settingsMenuContainer.style.right = "-100%";
  setTimeout(() => {
      settingsMenuContainer.style.display='none'
		}, 499);
}

export {
  setupSettingsMenu,
  showLS,
  hideLS
}