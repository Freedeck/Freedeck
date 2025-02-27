universal.listenFor("launch", () => {
	loadThemeListing();
});

window.loadThemeListing = async () => {
	document.querySelector(".themelist").innerHTML = "";
	for (const id of universal.theming.listing) {
		let theme = universal.theming.listingData[id];
		if (!theme) {
			theme = await universal.theming.fetchAndParse(id);
		}
		if(theme.showing && theme.showing === "false") continue;
		const element = document.createElement("div");
		element.className = "theme";
		const title = document.createElement("h2");
		title.innerText = theme.name;
		element.appendChild(title);
		const desc = document.createElement("p");
		desc.innerText = theme.description;
		const apply = document.createElement("i");
		apply.innerText = "Click to apply.";
		element.onclick = () => {
			universal.theming.setTheme(
				id, true
			);
			loadThemeListing();
		};
		if (universal.load("theme") === id) {
			title.innerText += " (Active)";
			element.style.background = "var(--selected-item-bg)";
			element.style.backgroundSize = "var(--selected-item-bg-size)";
			element.style.animation = "var(--selected-item-bg-anim)";
			apply.innerText = "";
		}
		element.appendChild(desc);
		element.appendChild(apply);
		document.querySelector(".themelist").appendChild(element);
	}
};
