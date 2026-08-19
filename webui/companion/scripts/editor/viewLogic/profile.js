import { loadData } from "../data.js";
import EditorViewLogic from "./EditorViewLogic.js";

const editorButton = document.querySelector("#editor-btn");

const select = document.createElement("select");
const generateProfileSelect = () => {
	select.innerHTML = "";
	for (const profile of Object.keys(universal.config.profiles)) {
		const option = document.createElement("option");
		option.innerText = profile;
		option.value = profile;
		select.appendChild(option);
	}
	select.onchange = (e) => {
		const int = JSON.parse(editorButton.getAttribute("data-interaction"));
		int.data.profile = e.srcElement.value;
		editorButton.setAttribute("data-interaction", JSON.stringify(int));
		loadData(int.data);
	};
};
const typeField = document.querySelector("#type");

class Profile extends EditorViewLogic {
	constructor() {
		super("profiles", "fd.profile");
		generateProfileSelect();
		this.setSectionTitleKey("editor.sections.no_action.folder_changer");
		this.setSectionDescriptionKey("editor.sections.folder_changer.action");

		this.setElementsToAdd(() => {
			return [select];
		});

		this.setOnRun(({ interactionData }) => {
			generateProfileSelect();
			select.value = interactionData.data?.profile;
		});

		this.setOnFirstSetup(({ interactionData }) => {
			const int = JSON.parse(editorButton.getAttribute("data-interaction"));
			int.type = "fd.profile";
			int.data.profile = "Default";
			editorButton.setAttribute("data-interaction", JSON.stringify(int));
			typeField.value = "fd.profile";
			generateProfileSelect();
			select.value = int.data.profile;
		});
	}
}

export default Profile;
