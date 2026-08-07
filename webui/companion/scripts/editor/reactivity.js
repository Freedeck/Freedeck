import { translatePage, translationKey } from "../../../shared/localization";
import { getAllTileData, loadData } from "./data";
const editorButton = document.querySelector("#editor-btn");
const color = document.querySelector("#color");
const name = document.querySelector("#name");
const type = document.querySelector("#type");
const renderType = document.querySelector("#rendertype");
const leftSidebar = document.querySelector(".sidebar");
const rightSidebar = document.querySelector("#sidebar");
const setIcon = document.querySelector("#upload-icon");

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

const setupReactivity = (d, tileName) => {
	const data = d.data;

	editorButton.innerText = tileName;
	name.value = tileName;
	renderType.value = d.renderType || "button";
	color.value = data.color || "none";

	editorButton.style.backgroundImage = "";

	if (data.icon) editorButton.style.backgroundImage = `url("${data.icon}")`;

	if (data.color) editorButton.style.backgroundColor = data.color;

	type.value = d.type || "fd.none";

	for (const w of settings) {
		w.addClassIf(d);
	}

	if (data._view) {
		for (const v of document.querySelectorAll(".plugin-view")) {
			v.style.display = "none";
		}
		document.querySelector("#select-plugin-back").style.display = "none";
		document.querySelector("#dynamic-view-container").style.display = "none";
		document.querySelector(`#plugin-view-${data._view}`).style.display =
			"block";
	}
	leftSidebar.classList.add("disabled");
	rightSidebar.classList.add("disabled");

	const pl = document.querySelector('button[data-view_id="plugins"]');
	if (!pl.classList.contains("has-tt")) {
		universal.createTooltipFor(
			pl,
			"<h4>" +
				translationKey("editor.sections.plugin.available") +
				"</h4>\n" +
				Object.values(universal.plugins)
					.filter((e) => e.types.length > 0)
					.map((e) => e.name)
					.join(",\n"),
		);
		pl.classList.add("has-tt");
	}

	const interactionData = d;
	document.querySelector("#plugin").style.display =
		interactionData.plugin !== "Freedeck" ? "flex" : "none";
	document.querySelector('label[for="plugin"]').style.display =
		interactionData.plugin !== "Freedeck" ? "flex" : "none";

	for (const i of settings) {
		i.makeVisible(interactionData);
		i.setupCheck(interactionData);
	}
};

const editorCtrl = document.querySelector("#editor-controls");
const editorAppr = document.querySelector("#editor-appearance");
function createEditorCheckbox(
	dataKey,
	key = "notranslation",
	section = editorCtrl,
	adds = "",
	visibilityCheck = () => true,
) {
	const ele = document.createElement("div");
	ele.classList.add("flex-wrap-r");
	ele.classList.add("alc");
	const label = document.createElement("label");
	label.textContent = universal.translationKey(key);
	const checkbox = document.createElement("input");
	checkbox.classList.add("fdc-checkbox");
	checkbox.type = "checkbox";
	checkbox.addEventListener("click", (e) => {
		const int = JSON.parse(editorButton.getAttribute("data-interaction"));
		if (!int.data[dataKey]) int.data[dataKey] = true;
		else int.data[dataKey] = !int.data[dataKey];
		editorButton.setAttribute("data-interaction", JSON.stringify(int));
		loadData(int.data);
		checkbox.checked = int.data[dataKey];
		const isCheck = e.srcElement.checked;
		if (isCheck) editorButton.classList.add(adds);
		else editorButton.classList.remove(adds);
	});
	ele.append(label, checkbox);
	section.appendChild(ele);
	return {
		element: ele,
		setupCheck(interaction) {
			checkbox.checked = interaction.data[dataKey] === "true";
		},
		makeVisible: (interaction) => {
			ele.style.display = visibilityCheck(interaction) ? "block" : "none";
		},
		addClassIf(interaction) {
			if (editorButton.classList.contains(adds)) {
				if (interaction.data[dataKey] === "true")
					editorButton.classList.add(adds);
				else editorButton.classList.remove(adds);
			}
		},
	};
}

const settings = [
	createEditorCheckbox(
		"showBg",
		"editor.appearance.no.background",
		editorAppr,
		"no-bg",
	),
	createEditorCheckbox(
		"noBorder",
		"editor.appearance.no.border",
		editorAppr,
		"no-border",
	),
	createEditorCheckbox(
		"noRounding",
		"editor.appearance.no.rounding",
		editorAppr,
		"no-rounding",
	),

	createEditorCheckbox("hold", "editor.controls.hold", editorCtrl),
	createEditorCheckbox(
		"longPress",
		"editor.controls.long_press",
		editorCtrl,
		(e) => e.renderType != "slider",
	),
	createEditorCheckbox(
		"onRelease",
		"editor.controls.on_release",
		editorCtrl,
		(e) => e.renderType != "slider",
	),
];

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

function closeEditor() {
	universal.uiSounds.playSound("int_no");
	for (const el of document.querySelectorAll(".k")) {
		el.classList.remove("smaller");
		el.classList.remove("blur");
	}
	universal.keys.classList.remove("smaller");
	editorDiv.style.animationName = "editor-pull-up";
	editorContainer.style.animation = "real-fade-out 0.25s";
	universal.keys.parentElement.classList.remove("editing");
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
	rightSidebar.classList.remove("disabled");
}

editorClose.addEventListener("click", closeEditor);

editorSave.addEventListener("click", () => {
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
	closeEditor();
});

setIcon.onclick = (e) => {
	universal.uiSounds.playSound("int_confirm");
	const ito = JSON.parse(editorButton.dataset.interaction);
	universal.listenForOnce("library_load", () => {
		universal.sendEvent("library_request", "icon");
	});
	universal.listenForOnce("library_paint", () => {
		if (ito.data.icon) {
			const preselectedElement = document.querySelector(
				`.upload[data-name='${ito.data.icon.split("/icons/")[1]}']`,
			);
			preselectedElement.classList.add("glow");
		}
		for (const uploadedIcon of document.querySelectorAll(
			".uploads-1 .upload",
		)) {
			uploadedIcon.onclick = () => {
				for (const glowingIcon of document.querySelectorAll(".glow")) {
					glowingIcon.classList.remove("glow");
				}
				uploadedIcon.classList.add("glow");

				ito.data.icon = `/icons/${uploadedIcon.dataset.name}`;
				editorButton.setAttribute("data-interaction", JSON.stringify(ito));
				editorButton.style.backgroundImage = `url("${`/icons/${uploadedIcon.dataset.name}`}")`;
				loadData(ito.data);
				universal.uiSounds.playSound("uploaded");
			};
		}
	});
	universal.vopen("library");
};

export { setupReactivity };
