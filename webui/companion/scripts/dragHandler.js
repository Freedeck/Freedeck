import gridItemDrag from "./lib/gridItemDrag.js";
gridItemDrag.setFilter("#keys .button");
gridItemDrag.unmovableClass = ".builtin, .unset";
gridItemDrag.setContext(universal.keys);
universal.listenFor("page_change", () => {
	gridItemDrag.setContext(universal.keys);
});
const mtNextPage = document.querySelector(".mt-next-page");
const mtPrevPage = document.querySelector(".mt-prev-page");
gridItemDrag.on("drop", (event, origIndex, targIndex) => {
	mtNextPage.style.display = "none";
	mtPrevPage.style.display = "none";

	if (
		event.target.classList.contains("mt-next-page") ||
		event.target.classList.contains("mt-prev-page")
	) {
		const wanted = event.target.classList.contains("mt-next-page");
		// true -> next, false -> prev

		universal.page += wanted ? 1 : -1;
		universal.save("page", universal.page);
		universal.sendEvent("page_change");

		// BUT, we need to move the item to the highest or lowest index
		const originalIndex =
			Number.parseInt(origIndex) +
			(universal.page < 0 ? 1 : 0) +
			(universal.page > 0
				? universal.config.iconCountPerPage * universal.page
				: 0);
		let targetIndex = 0;

		if (wanted) {
			// We need to find the first empty slot
			for (const item of universal.config.profiles[universal.config.profile]) {
				if (item.pos === targetIndex) {
					targetIndex++;
				} else {
					break;
				}
			}

			// We need to move the item to the targetIndex
		} else {
			// todo
		}

		const changed = document.querySelector(`#keys .button.k-${origIndex}`);

		universal.send(universal.events.companion.move_tile, {
			name: changed.getAttribute("data-name"),
			item: changed.getAttribute("data-interaction"),
			newIndex: targetIndex,
			oldIndex: originalIndex,
		});

		return;
	}

	const originalIndex =
		Number.parseInt(origIndex) +
		universal.page * Number.parseInt(universal.config.iconCountPerPage);
	const targetIndex =
		Number.parseInt(targIndex) +
		universal.page * Number.parseInt(universal.config.iconCountPerPage);
	const ev = universal.page < 0 ? 1 : 0;

	const changed = document.querySelector(`#keys .button.k-${origIndex}`);
	changed.classList.remove(`k-${origIndex}`);
	changed.classList.add(`k-${targIndex}`);
	event.target.classList.remove(`k-${targIndex}`);
	event.target.classList.add(`k-${origIndex}`);

	const targetInter = JSON.parse(changed.getAttribute("data-interaction"));
	universal.send(universal.events.companion.move_tile, {
		name: changed.getAttribute("data-name"),
		item: changed.getAttribute("data-interaction"),
		newIndex: targetIndex + ev,
		oldIndex: originalIndex + ev,
	});
	changed.pos = targetIndex;
	changed.setAttribute("data-interaction", JSON.stringify(targetInter));
});

gridItemDrag.on("dragging", (e) => {
	document.querySelector("#keys").appendChild(mtNextPage.cloneNode(true));
	document.querySelector("#keys").appendChild(mtPrevPage.cloneNode(true));
	// copy the next and prev buttons to the keys container
	const currentPage = Number.parseInt(universal.load("page"));
	if (universal.UI.Pages[currentPage - 1]) mtPrevPage.style.display = "flex";
	mtNextPage.style.display = "flex";
});
