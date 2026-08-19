const gridItemDrag = {
	_filter: null,
	_ctx: null,
	dragging: false,
	_draggedItem: null,
	_originalIndex: null,
	_targetIndex: null,
	no: ".builtin",
	unmovableClass: "unmovable",
	selectedGlowClass: "glow-tile",
	movingElementClass: "moving",
	secondaryAllow: ".sal",
	setFilter: (filter) => {
		gridItemDrag._filter = filter;
	},
	setContext: (ctx) => {
		gridItemDrag._ctx = ctx;
		gridItemDrag.load();
		for (const item of document.querySelectorAll(gridItemDrag._filter)) {
			item.setAttribute("draggable", "true");
		}
		for (const item of document.querySelectorAll(
			`${gridItemDrag.unmovableClass}`,
		)) {
			item.setAttribute("draggable", "false");
		}
	},
	_onDragStart: (e) => {
		if (e.target.matches(gridItemDrag._filter)) {
			gridItemDrag.dragging = true;
			gridItemDrag._draggedItem = e.target;
			gridItemDrag._originalIndex = Array.from(
				gridItemDrag._ctx.children,
			).indexOf(gridItemDrag._draggedItem);
			gridItemDrag._draggedItem.classList.add(gridItemDrag.movingElementClass);
			for (const listener of gridItemDrag._eventListeners) {
				if (listener.event !== "dragging") continue;
				listener.callback(e);
			}
		}
	},
	_onDragEnd: (e) => {
		gridItemDrag.dragging = false;
		gridItemDrag._draggedItem = null;
		gridItemDrag._originalIndex = null;
		gridItemDrag._targetIndex = null;
	},
	_onDragOver: (e) => {
		e.preventDefault();
	},
	_onDragEnter: (e) => {
		if (
			gridItemDrag.dragging &&
			((e.target.matches(gridItemDrag._filter) &&
				!e.target.matches(gridItemDrag.no)) ||
				e.target.matches(gridItemDrag.secondaryAllow))
		) {
			const target = e.target;
			const targetIndex = Array.from(gridItemDrag._ctx.children).indexOf(
				target,
			);

			if (
				target !== gridItemDrag._draggedItem &&
				target.classList.contains(gridItemDrag.unmovableClass) === false
			) {
				gridItemDrag._targetIndex = targetIndex;
				target.classList.add(gridItemDrag.selectedGlowClass);
				target.ondragleave = () => {
					target.classList.remove(gridItemDrag.selectedGlowClass);
				};
				target.ondragend = () => {
					target.classList.remove(gridItemDrag.selectedGlowClass);
				};
			} else {
				gridItemDrag._targetIndex = null;
			}
		}
	},
	_onDrop: (e) => {
		e.preventDefault();
		if (e.target === gridItemDrag._ctx) return;
		if (e.target.matches(gridItemDrag.no)) return;
		const draggedItem = gridItemDrag._draggedItem;

		if (
			gridItemDrag._targetIndex !== null &&
			gridItemDrag._targetIndex !== gridItemDrag._originalIndex
		) {
			const target = gridItemDrag._ctx.children[gridItemDrag._targetIndex];

			const draggedItemSibling =
				draggedItem.nextElementSibling === target
					? draggedItem
					: draggedItem.nextElementSibling;

			target.classList.remove(gridItemDrag.selectedGlowClass);

			gridItemDrag._ctx.insertBefore(draggedItem, target);
			gridItemDrag._ctx.insertBefore(target, draggedItemSibling);
		}
		draggedItem.classList.remove(gridItemDrag.movingElementClass);

		if (gridItemDrag._targetIndex == null)
			gridItemDrag._targetIndex = gridItemDrag._originalIndex;

		for (const listener of gridItemDrag._eventListeners) {
			if (listener.event !== "drop") continue;
			listener.callback(
				e,
				gridItemDrag._originalIndex,
				gridItemDrag._targetIndex,
			);
		}

		gridItemDrag.dragging = false;
		gridItemDrag._draggedItem = null;
		gridItemDrag._targetIndex = null;
	},
	load: () => {
		gridItemDrag._ctx.addEventListener("dragstart", gridItemDrag._onDragStart);
		gridItemDrag._ctx.addEventListener("dragend", gridItemDrag._onDragEnd);
		gridItemDrag._ctx.addEventListener("dragover", gridItemDrag._onDragOver);
		gridItemDrag._ctx.addEventListener("dragenter", gridItemDrag._onDragEnter);
		gridItemDrag._ctx.addEventListener("drop", gridItemDrag._onDrop);
	},

	_eventListeners: [],
	on: (ev, callback) => {
		gridItemDrag._eventListeners.push({ event: ev, callback });
	},
};

export default gridItemDrag;
