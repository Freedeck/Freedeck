import { translatePage, translationKey } from "../../../shared/localization";
import { getAllTileData, loadData } from "./data";
import { openViewTop, closeAllViews } from "./viewEngine.js";
const editorButton = document.querySelector("#editor-btn");
const color = document.querySelector("#color");
const name = document.querySelector("#name");
const type = document.querySelector("#type");
const renderType = document.querySelector("#rendertype");
const leftSidebar = document.querySelector(".sidebar");

color.onchange = (e) => {
	editorButton.style.backgroundColor = e.srcElement.value;
	color.dataset.has_set = "true";
	const interaction = JSON.parse(editorButton.getAttribute("data-interaction"));
	interaction.data.color = e.srcElement.value;
	editorButton.setAttribute("data-interaction", JSON.stringify(interaction));
	universal.loadEditorData(interaction.data);
};

name.onkeyup = (e) => {
	editorButton.innerText = e.srcElement.value;
};

const wants = [
	{
		class: "no-bg",
		data: "showBg",
		selector: "#sbg",
	},
	{
		class: "no-border",
		data: "noBorder",
		selector: "#nbo",
	},
	{
		class: "no-rounding",
		data: "noRounding",
		selector: "#nbr",
	},
];

for (const w of wants) {
	document.querySelector(w.selector).onclick = (e) => {
		const isCheck = e.srcElement.checked;
		if (isCheck) editorButton.classList.add(w.class);
		else editorButton.classList.remove(w.class);
	};
}

universal.listenFor("editTile", (d, tileName) => {
	const data = d.data;

	editorButton.innerText = tileName;
	name.value = tileName;
	renderType.value = d.renderType || "button";
	color.value = data.color || "none";

	editorButton.style.backgroundImage = "";

	if (data.icon) editorButton.style.backgroundImage = `url("${data.icon}")`;

	if (data.color) editorButton.style.backgroundColor = data.color;

	type.value = d.type || "fd.none";

	for (const w of wants) {
		if (data[w.data] === "true") editorButton.classList.add(w.class);
		else editorButton.classList.remove(w.class);
	}

	if (data._view) {
		for (const v of document.querySelectorAll(".plugin-view")) {
			v.style.display = "none";
		}
		document.querySelector("#plugins-only").style.display = "none";
		document.querySelector(`#plugin-view-${data._view}`).style.display =
			"block";
	}
	leftSidebar.classList.add("disabled");

	const interactionData = d;
		document.querySelector("#plugin").style.display =
		interactionData.plugin !== "Freedeck" ? "flex" : "none";
	document.querySelector('label[for="plugin"]').style.display =
		interactionData.plugin !== "Freedeck" ? "flex" : "none";

	document.querySelector("#sbg").style.display =
		interactionData.renderType === "button"
			? "block"
			: interactionData.renderType === "slider"
				? "none"
				: "block";
	document.querySelector('label[for="sbg"]').style.display =
		interactionData.renderType === "button"
			? "block"
			: interactionData.renderType === "slider"
				? "none"
				: "block";

	document.querySelector("#lp").style.display =
		interactionData.renderType === "slider" ? "none" : "block";
	document.querySelector('label[for="lp"]').style.display =
		interactionData.renderType === "slider" ? "none" : "block";

		
	setCheck("#orl", "onRelease", interactionData);
	setCheck("#lp", "longPress", interactionData);
	setCheck("#sbg", "showBg", interactionData);
	setCheck("#nbo", "noBorder", interactionData);
	setCheck("#nbr", "noRounding", interactionData);
	setCheck("#ha", "hold", interactionData);

	// openViewTop("appearance")

});

function setCheck(id, key, interaction) {
	document.querySelector(id).checked = interaction.data[key] === "true";
}


function createEditorCheckbox(selector, dataKey) {
	document.querySelector(selector).addEventListener("click", (e) => {
		const int = JSON.parse(editorButton.getAttribute("data-interaction"));
		if (!int.data[dataKey]) int.data[dataKey] = true;
		else int.data[dataKey] = !int.data[dataKey];
		editorButton.setAttribute("data-interaction", JSON.stringify(int));
		loadData(int.data);
		document.querySelector(selector).checked = int.data[dataKey];
	});
}

// createEditorCheckbox("#sbg", "showBg");
// createEditorCheckbox("#nbo", "noBorder");
// createEditorCheckbox("#nbr", "noRounding");
// createEditorCheckbox("#orl", "onRelease");
// createEditorCheckbox("#lp", "longPress");
// createEditorCheckbox("#ha", "hold");

const editorSave = document.querySelector("#editor-save");
const editorClose = document.querySelector("#editor-close");
const editorDiv = document.querySelector("#editor-div");
const editorContainer = document.querySelector("#editor");

const toggleSidebarContainer = document.querySelector(".toggle-sidebar");
const toggleSidebarButton = document.querySelector(".toggle-sidebar button");

const tt = universal.createTooltipFor(
	editorClose,
	translationKey("tooltips.editor.closing"),
);
tt.setAttribute("data-i18n-key", "tooltips.editor.closing");
translatePage(tt);

editorClose.onclick = () => {
	universal.uiSounds.playSound("int_no");
	for (const el of document.querySelectorAll(".k")) {
		el.classList.remove("smaller");
		el.classList.remove("blur");
	}
	universal.keys.classList.remove("smaller");
	editorDiv.style.animationName = "editor-pull-up";
	editorContainer.style.animation = "real-fade-out 0.25s";
	universal.keys.parentElement.style.transform = "translate(-50%, -50%)";
	document.querySelector("#sidebar").style.right = "0";
	editorButton.dataset.state = "not";
	toggleSidebarButton.style.display = "block";
	if (toggleSidebarContainer.style.left === "0px") toggleSidebarButton.click();
	setTimeout(() => {
		editorContainer.style.animation = "";
		editorContainer.style.display = "none";
		editorDiv.style.animationName = "editor-pull-down";
		document.querySelector("#color").value = "#000000";
		document.querySelector("#color").dataset.has_set = "false";
		editorButton.style.backgroundColor = "";
	}, 249);
	leftSidebar.classList.remove("disabled");
};

editorSave.onclick = () => {
	const tileName = name.value;
	const interaction = JSON.parse(editorButton.getAttribute("data-interaction"));
	const tileData = getAllTileData();
	for (const input in tileData) {
		interaction.data[input] = tileData[input];
	}
	universal.send(universal.events.companion.edit_tile, {
		name: tileName,
		oldName: editorButton.getAttribute("data-pre-edit"),
		interaction: interaction,
	});
	editorClose.click();
};
