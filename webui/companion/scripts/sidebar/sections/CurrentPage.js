import { UI } from "../../../../client/scripts/ui";
import { translationKey } from "../../../../shared/localization";
import { SidebarSection, SidebarButton, SidebarCheck } from "../SidebarSection";

const style = new SidebarSection("", "CurrentPage");

style.children.push({
	build: () => {
		const h1 = document.createElement("h1");
		h1.classList.add("cpage");
		h1.innerText = `${translationKey("sidebars.left.pages.page")}${universal.page + 1}/${Object.keys(UI.Pages).length}`;
		return h1;
	},
});

const tryButtons = new SidebarCheck(
	translationKey("sidebars.left.pages.try"),
	"sdbtry",
	(e) => {
		universal.flags.toggle("try_buttons");
	},
	universal.flags.isEnabled("try_buttons"),
);

const previousPage = new SidebarButton(
	translationKey("sidebars.left.pages.previous"),
	(e) => {
		if (UI.Pages[universal.page - 1]) {
			universal.page--;
			universal.save("page", universal.page);
			universal.uiSounds.playSound("page_down");
			UI.reloadTiles();
			universal.sendEvent("page_change");
			universal.sendEvent("animate_page");
		}
	},
);

const nextPage = new SidebarButton(
	translationKey("sidebars.left.pages.next"),
	(e) => {
		if (UI.Pages[universal.page + 1]) {
			universal.page++;
			universal.save("page", universal.page);
			universal.uiSounds.playSound("page_up");
			UI.reloadTiles();
			universal.sendEvent("page_change");
			universal.sendEvent("animate_page");
		}
	},
);
style.children.push(tryButtons);

style.children.push({
	build: () => {
		const div = document.createElement("div");
		div.classList.add("flex-wrap-r");
		div.appendChild(previousPage.build());
		div.appendChild(nextPage.build());
		return div;
	},
});

document.querySelector(".sidebar").appendChild(style.build());
