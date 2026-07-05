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
		this.sectionTitle = universal.translationKey(k)
	}
	setSectionDescriptionKey(k) {
		this.sectionDesc = universal.translationKey(k)
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

    // 2. Clear old elements injected by the previous view
    targetSlot.innerHTML = "";

    // 3. Update Title & Descriptions dynamically
    titleEl.innerText = this.sectionTitle || "";
    descEl.innerText = this.sectionDesc || "";

    // 4. Inject current elements registered by the view
    const elements = this.elementsToAdd();
		console.log("Inject", elements)
    if (Array.isArray(elements)) {
      elements.forEach(el => targetSlot.appendChild(el));
    }

    // 5. Unveil the dynamic window interface
    container.style.display = "block";
		this.onRun(...args);
	}
	firstSetup() {
		this.onFirstSetup();
	}
}

export default EditorViewLogic;
