import "./sidebar/sections/MobileDevice.js";
import "./sidebar/sections/CurrentPage.js";
import "./sidebar/sections/Client.js";
import "./sidebar/sections/Soundboard.js";
import "./sidebar/sections/Style.js";
import "./sidebar/sections/Profiles.js";

import "./sidebar/sections/Footer.js";

import contextual from "./lib/ctxl.js";
universal.ctx = contextual;

contextual.addView("marketplace");
contextual.addView("plugins");
contextual.addView("settings");
contextual.addView("library");

HTMLElement.prototype.setHTML = function (html) {
	this.innerHTML = html;
};

universal.listenFor("init", () => {
	const login = document.createElement("li");
	login.id = "constat";
	document.querySelector("#sidebar > ul").appendChild(login);
});

document.onkeydown = (ev) => universal.uiSounds.playSound("int_type");

const sidebar = [
	{ Home: "index.html" },
	{ Library: "library.html" },
	{ Plugins: "plugins.html" },
	{ Marketplace: "marketplace.html" },
	{ Settings: "settings.html" },
	{ Connect: "/connect2.html?id=Companion&new_ip=true" },
	// {'Webpack Recompile': '+universal.send(universal.events.default.recompile)'}
];

const pages = ["library", "plugins", "marketplace", "settings"];

const sidebarEle = document.createElement("div");
sidebarEle.id = "sidebar";
const sidebarUl = document.createElement("ul");
sidebarEle.appendChild(sidebarUl);
sidebarUl.setHTML(
	'<li style="font-size: .65em; background: none; margin: 0 auto;"><h2>Freedeck</h2></li>',
);
for (const itm of sidebar) {
	const name = Object.keys(itm)[0];
	const val = itm[name];
	const page = pages.find((p) => val.includes(p)) || val;
	if (val.startsWith("+")) {
		const ele = document.createElement("li");
		ele.setHTML(`<a onclick="${val.substring(1)}">${name}</a>`);
		sidebarUl.appendChild(ele);
		break;
	}
	const ele = document.createElement("li");
	ele.setAttribute("hovereffect", "yes");
	ele.setHTML(`<a onclick="universal.vopen('${page}')">${name}</a>`);
	sidebarUl.appendChild(ele);
}

universal.vopen = (v) => {
	universal.uiSounds.playSound("sidebar");
	console.log("vopen", v);
	if (!pages.includes(v)) {
		if (document.querySelector(universal.ctx.view_container))
			document.querySelector(universal.ctx.view_container).style.display =
				"none";
		if (v.startsWith("/")) {
			window.location.href = v;
		}
		return;
	}
	if (document.querySelector(universal.ctx.view_container))
		document.querySelector(universal.ctx.view_container).style.display =
			"block";
	universal.ctx.destructiveView(v);
	universal.doCtxlLoadAnim();
};

document.body.appendChild(sidebarEle);
