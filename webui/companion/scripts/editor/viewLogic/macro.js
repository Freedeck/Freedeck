import EditorViewLogic from "./EditorViewLogic.js";
import { setTileData } from "../data.js";

let select, optionMacro, inputMacro;
const type = document.querySelector("#type");
const editorButton = document.querySelector("#editor-btn");

class Macro extends EditorViewLogic {
	constructor() {
		super("macro", "fd.macro", "fd.macro_text");
		this.setSectionTitleKey("editor.sections.no_action.macro");
		this.setSectionDescriptionKey("editor.sections.macro.action");
		const container = document.createElement("div");
		const pickOne = document.createElement("p");
		pickOne.textContent = universal.translationKey(
			"editor.sections.macro.control",
		);
		select = document.createElement("select");

		const optionText = document.createElement("option");
		optionText.value = "text";
		optionText.textContent = universal.translationKey(
			"editor.sections.macro.control.action_text",
		);

		optionMacro = document.createElement("option");
		optionMacro.value = "macro";
		optionMacro.textContent = universal.translationKey(
			"editor.sections.macro.control.action_macro",
		);
		select.append(optionText, optionMacro);

		inputMacro = document.createElement("input");

		inputMacro.onchange = (e) => {
			const int = JSON.parse(editorButton.getAttribute("data-interaction"));
			setTileData("macro", e.srcElement.value, int);
			int.data.macro = e.srcElement.value;
		};
		select.onchange = (e) => {
			const int = JSON.parse(editorButton.getAttribute("data-interaction"));
			int.type = e.srcElement.value === "text" ? "fd.macro_text" : "fd.macro";
			document.querySelector("#type").innerText = int.type;
			editorButton.setAttribute("data-interaction", JSON.stringify(int));
		};

		container.append(pickOne, select, inputMacro);
		this.setElementsToAdd(() => {
			return [container];
		});

		this.setOnRun(({ interactionData }) => {
			const data = interactionData.data;
			if (data.macro) {
				inputMacro.value =
					interactionData.type === "fd.macro" ? "macro" : "text";
				inputMacro.value = data.macro;
			}
		});

		this.setOnFirstSetup(() => {
			const int = JSON.parse(editorButton.getAttribute("data-interaction"));
			int.type = "fd.macro_text";
			type.value = "fd.macro_text";
			editorButton.setAttribute("data-interaction", JSON.stringify(int));
		});
	}
}

export default Macro;
