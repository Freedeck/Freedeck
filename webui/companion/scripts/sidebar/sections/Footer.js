import { SidebarSection } from "../SidebarSection";
import { translationKey } from "../../../../shared/localization";

const style = new SidebarSection("", "Footer", ["mobd", "rem-mobd"]);

style.children.push({
	build: () => {
		const elem = document.createElement("h2");
		elem.innerText = "Freedeck";
		elem.style.textAlign = "center";
		return elem;
	},
});

style.children.push({
	build: () => {
		const elem = document.createElement("p");
		elem.innerText = translationKey("sidebars.left.footer.thanks");
		elem.style.textAlign = "center";
		elem.style.fontSize = "0.75em";
		return elem;
	},
});

style.children.push({
	build: () => {
		const elem = document.createElement("small");
		elem.innerHTML = `${translationKey("sidebars.left.footer.github_pre")}<a href="https://github.com/Freedeck/Freedeck" target="_blank">${translationKey("sidebars.left.footer.github")}.</a><br><br>${translationKey("sidebars.left.footer.need_help")}<a href="https://wiki.freedeck.app" target="_blank">${translationKey("sidebars.left.footer.need_help.wiki")}</a>`;
		elem.style.textAlign = "center";
		return elem;
	},
});

style.children.push({
	build: () => {
		const elem = document.createElement("br");
		return elem;
	},
});

document.querySelector(".sidebar").appendChild(style.build());
