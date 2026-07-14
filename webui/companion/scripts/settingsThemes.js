universal.listenFor("launch", () => {
	loadThemeListing();
	universal.on(universal.events.companion.set_theme, () => {
		loadThemeListing();
	});
});

if (universal.events?.companion?.set_theme) {
	universal.on(universal.events.companion.set_theme, () => {
		loadThemeListing();
	});
}

const themeList = document.querySelector(".themelist");
let _scroll = themeList.scrollTop;
window.loadThemeListing = async () => {
	_scroll = themeList.scrollTop;
	themeList.innerHTML = "";
	for (const id of universal.theming.listing) {
		let theme = universal.theming.listingData[id];
		if (!theme) {
			theme = await universal.theming.fetchAndParse(id);
		}
		if (theme.showing && theme.showing === "false") continue;
		const element = document.createElement("div");
		element.className = "theme";
		const title = document.createElement("h2");
		title.innerText = theme.name + " ";
		if (theme.version) {
			const version = document.createElement("small");
			version.textContent = theme.version;
			title.appendChild(version);
		}
		element.appendChild(title);
		const desc = document.createElement("p");
		desc.innerText = theme.description;
		const apply = document.createElement("i");
		apply.innerText = "Click to apply.";
		element.onclick = () => {
			if (theme.warn) {
				universal.ui.show.showYesNo(
					universal.translationKey("settings.sections.style.themes.warning"),
					theme.warn,
					() => {
						universal.theming.setTheme(id, true);
						loadThemeListing();
					},
				);
			} else {
				universal.theming.setTheme(id, true);
				loadThemeListing();
			}
		};
		if (universal.load("theme") === id) {
			title.innerText += universal.translationKey(
				"settings.sections.style.themes.active",
			);
			element.style.background = "var(--selected-item-bg)";
			element.style.backgroundSize = "var(--selected-item-bg-size)";
			element.style.animation = "var(--selected-item-bg-anim)";
			apply.innerText = "";
		}
		element.appendChild(desc);
		element.appendChild(apply);
		themeList.appendChild(element);
	}
	themeList.scrollTop = _scroll;
};
