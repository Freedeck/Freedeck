import { translateElement } from "../../../../shared/localization";

class EditorViewLogic {
	types;
	view;
	sectionTitle;
	sectionDesc;
	onRun;
	onFirstSetup;
	elementsToAdd;
	constructor(view, ...types) {
		this.types = types;
		this.view = view;
		this.onRun = () => {};
		this.onFirstSetup = () => {};
		this.elementsToAdd = () => [];
	}
	setSectionTitleKey(k) {
		this.sectionTitle = universal.translationKey(k);
	}
	setSectionDescriptionKey(k) {
		this.sectionDesc = universal.translationKey(k);
	}
	setElementsToAdd(dom) {
		this.elementsToAdd = dom;
	}
	setOnRun(onRun) {
		this.onRun = onRun;
	}
	setOnFirstSetup(onFirstSetup) {
		this.onFirstSetup = onFirstSetup;
	}
	forwardRunningEvent(currentType, prerun, ...args) {
		let isRunning = false;
		if (
			this.types.includes(currentType) ||
			(this.types.includes("#*") && !currentType.startsWith("fd."))
		) {
			isRunning = true;
			prerun();
			this.run(...args);
		}
		return isRunning;
	}
	run(...args) {
		const container = document.querySelector("#dynamic-view-container");
		const titleEl = document.querySelector("#dynamic-view-title");
		const descEl = document.querySelector("#dynamic-view-description");
		const targetSlot = document.querySelector("#dynamic-view-elements");

		targetSlot.innerHTML = "";

		titleEl.innerText = this.sectionTitle || "";
		descEl.innerText = this.sectionDesc || "";

		const elements = this.elementsToAdd();
		if (Array.isArray(elements)) {
			elements.forEach((el) => targetSlot.appendChild(el));
		}

		container.style.display = "flex";
		this.onRun(...args);
	}
	firstSetup() {
		this.onFirstSetup();
	}
}

export default EditorViewLogic;
