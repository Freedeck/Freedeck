import { UI } from "../../client/scripts/ui.js";
import { universal } from "../../shared/universal.js";
import { openViewTop, closeAllViews } from "./editor/viewEngine.js";
import { loadData } from "./editor/data.js";
import "./sidebar.js";
import "./uploadsHandler.js";
import "./editor/loader.js";
import "./contextMenu.js";
import { makeThanks } from "./changelog/create.js";
import Sound from "./editor/viewLogic/sound.js";
import Plugins from "./editor/viewLogic/plugins.js";
import System from "./editor/viewLogic/system.js";
import Macro from "./editor/viewLogic/macro.js";
import Profile from "./editor/viewLogic/profile.js";
import "./dragHandler.js";
import { translationKey } from "../../shared/localization.js";
import EditorView from "./classes/EditorView.js";
const leftSidebar = document.querySelector(".sidebar");

await universal.init("Companion");

if (universal.load("has_setup") === "false") {
	universal.ctx.destructiveView("setup");
	const view_container = document.querySelector(universal.ctx.view_container);
	view_container.style.display = "block";
	leftSidebar.style.display = "none";
}

const editorButton = document.querySelector("#editor-btn");
const editorContainer = document.querySelector("#editor");
const editorDiv = document.querySelector("#editor-div");

const toggleSidebarContainer = document.querySelector(".toggle-sidebar");
const toggleSidebarButton = document.querySelector(".toggle-sidebar button");

toggleSidebarButton.onclick = (ev) => {
	if (leftSidebar.style.display === "flex") {
		if (!ev.target.dataset.nosound) universal.uiSounds.playSound("slide_close");
		leftSidebar.style.animation = "sidebar-slide-out 0.5s";
		leftSidebar.style.animationFillMode = "forward";
		toggleSidebarButton.style.transform = "rotate(0deg)";
		toggleSidebarContainer.style.left = "0";
		setTimeout(() => {
			leftSidebar.style.display = "none";
		}, 500);
	} else {
		if (!ev.target.dataset.nosound) universal.uiSounds.playSound("slide_open");
		leftSidebar.style.display = "flex";
		leftSidebar.style.animation = "sidebar-slide-in 0.5s";
		toggleSidebarButton.style.transform = "rotate(180deg)";
		toggleSidebarContainer.style.left = "calc(11.5%)";
	}
};

const editorBuiltInViews = [
	new EditorView(
		"audio",
		new Sound(),
		"editor.sections.no_action.soundboard",
		"/common/icons/t_audio.svg",
	),
	new EditorView(
		"plugins",
		new Plugins(),
		"editor.sections.no_action.plugin",
		"/common/icons/t_plugin.svg",
	),
	new EditorView(
		"macro",
		new Macro(),
		"editor.sections.no_action.macro",
		"/common/icons/t_plugin.svg",
	),
	new EditorView(
		"system",
		new System(),
		"editor.sections.no_action.app_volume",
		"/common/icons/t_app_volume.svg",
	),
	new EditorView(
		"profiles",
		new Profile(),
		"editor.sections.no_action.folder_changer",
		"/common/icons/t_folder.svg",
	),
];

const pluginListing = document.querySelector(".plugin-view-listing");
for (const view of editorBuiltInViews) {
	console.log(`Setting up ${view.id}`);
	const viewButton = document.createElement("button");
	const keyInfo = document.createElement("p");
	const keyIcon = document.createElement("img");
	keyInfo.setAttribute("data-i18n-key", view.noActionTranslationKey);
	keyInfo.innerText = translationKey(view.noActionTranslationKey);
	keyIcon.src = view.icon;
	keyIcon.loading = "lazy";
	viewButton.onclick = (e) => {
		openViewTop(view.logic.view);
		view.logic.onFirstSetup({
			interactionData: JSON.parse(
				editorButton.getAttribute("data-interaction"),
			),
		});
		e.preventDefault();
	};
	viewButton.appendChild(keyInfo);
	viewButton.appendChild(keyIcon);
	pluginListing.appendChild(viewButton);
}
UI.reloadPluginViews();

/**
 * Edit a tile
 * @param {*} e HTML Element corresponding to the button that we grabbed context from
 */
function editTile(e) {
	universal.uiSounds.playSound("editor_open");
	const interactionData = JSON.parse(
		e.srcElement.getAttribute("data-interaction"),
	);
	editorButton.dataset.state = "init";
	universal.keys.classList.add("smaller");
	for (const el of document.querySelectorAll(".k")) {
		el.classList.add("smaller");
		el.classList.add("blur");
	}

	e.srcElement?.classList?.remove("smaller");

	const contextMenu = document.querySelector(".contextMenu");
	if (contextMenu) contextMenu.remove();

	for (const el of document.querySelectorAll(".plugin-view")) {
		el.style.display = "none";
	}

	editorContainer.style.display = "block";

	editorButton.setAttribute("data-pre-edit", e.srcElement.dataset.name);
	editorButton.setAttribute(
		"data-interaction",
		e.srcElement.getAttribute("data-interaction"),
	);

	document.querySelector("#editor-back").style.display = "flex";

	closeAllViews();
	if (interactionData.data) {
		const itm = interactionData.data;
		loadData(itm);
	}

	if (!interactionData.type.startsWith("fd.")) {
		editorBuiltInViews[1].logic.forwardRunningEvent(
			interactionData.type,
			() => {
				openViewTop("plugins");
			},
			{ interactionData },
		);
	}

	if (interactionData.type === "fd.none" && !interactionData.data._view) {
		openViewTop("none");
		document.querySelector("#editor-back").style.display = "none";
	} else {
		for (const v of editorBuiltInViews) {
			v.logic.forwardRunningEvent(
				interactionData.type,
				() => {
					openViewTop(v.logic.view);
				},
				{ interactionData },
			);
		}
	}

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

	editorDiv.style.animationName = "editor-pull-down";
	universal.keys.parentElement.style.transform = "translate(-50%, -115%)";
	toggleSidebarButton.style.display = "none";

	universal.sendEvent("editTile", interactionData, e.srcElement.dataset.name);
}

universal.editTile = editTile;

const editorBackButton = document.querySelector("#editor-back");
editorBackButton.onclick = () => {
	editorBackButton.style.display = "none";
	openViewTop("none");
};

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

createEditorCheckbox("#sbg", "showBg");
createEditorCheckbox("#nbo", "noBorder");
createEditorCheckbox("#nbr", "noRounding");
createEditorCheckbox("#orl", "onRelease");
createEditorCheckbox("#lp", "longPress");
createEditorCheckbox("#ha", "hold");

window.UniversalUI = {
	show: {
		showEditModal: (title, description, callback) => {
			const modal = universal.ui.makeGenericModal(
				title,
				"",
				[
					{
						text: "Submit",
						onclick: () => {
							const returned = callback({
								value: modalInput.value,
								feedback: modalFeedback,
							});
							if (returned === false) return;
							modal.close();
						},
					},
				],
				false,
			);
			const modalContent = modal.content;

			const modalFeedback = document.createElement("div");
			modalFeedback.classList.add("modalFeedback");
			modalContent.appendChild(modalFeedback);

			const modalInput = document.createElement("input");
			modalInput.type = "text";
			modalInput.placeholder = description;
			modalInput.classList.add("modalInput_text");
			modalContent.appendChild(modalInput);

			modal.show();
			return modal;
		},
		showPick(title, listContent, callback, extraM = "", closable = true) {
			const modal = UI.makeGenericModal(
				title,
				extraM,
				[
					{
						text: "Save",
						onclick: () => {
							const selectedItem = modalList.options[modalList.selectedIndex];
							const value = JSON.parse(selectedItem.value);
							const returned = callback({
								modal,
								value,
								modalFeedback,
								modalContent,
							});
							if (returned === false) return;
							modal.close();
						},
					},
				],
				closable,
			);

			const modalContent = modal.content;

			const modalFeedback = document.createElement("div");
			modalFeedback.classList.add("modalFeedback");

			const modalList = document.createElement("select");
			modalList.className = "modalList";
			modalList.style.marginBottom = "20px";

			modalContent.appendChild(modalFeedback);
			modalContent.appendChild(modalList);

			for (const item of listContent) {
				const modalItem = document.createElement("option");
				modalItem.className = "modalItem";
				modalItem.setAttribute("value", JSON.stringify(item));
				modalItem.innerText = item.name || item.display;
				modalList.appendChild(modalItem);
			}

			universal.uiSounds.playSound("int_prompt");
			modal.show();
			return modal;
		},
		showYesNo(title, content, yesCallback, closable = true) {
			const modal = universal.UI.makeGenericModal(
				title,
				content,
				[
					{
						text: "Continue",
						onclick: () => {
							modal.close();
							yesCallback();
						},
					},
				],
				closable,
			);

			modal.show();
			universal.uiSounds.playSound("int_confirm");
			return modal;
		},
	},
};

window.onclick = (e) => {
	if (e.srcElement.className !== "contextMenu") {
		const contextMenu = document.querySelector(".contextMenu");
		if (contextMenu) contextMenu.remove();
	}
	universal.uiSounds.playSound("click");
};

document.addEventListener("keydown", (ev) => {
	if (editorButton.dataset.state !== "not") return;
	if (ev.key === "ArrowLeft") {
		if (UI.Pages[universal.page - 1]) {
			universal.page--;
			universal.save("page", universal.page);
			universal.uiSounds.playSound("page_down");
			UI.reloadSounds();
			universal.sendEvent("page_change");
			universal.sendEvent("animate_page");
		}
	}
	if (ev.key === "ArrowRight") {
		if (UI.Pages[universal.page + 1]) {
			universal.page++;
			universal.save("page", universal.page);
			universal.uiSounds.playSound("page_up");
			UI.reloadSounds();
			universal.sendEvent("page_change");
			universal.sendEvent("animate_page");
		}
	}
});

universal.on(universal.events.user_mobile_conn, (isConn) => {
	if (universal.load("has_setup") === "false") return;
	universal.waitForElement(".mobd", (ele) => {
		ele.style.display = isConn ? "none" : "flex";
	});
	universal.uiSounds.playSound(`mobile_${isConn ? "" : "dis"}connect`);
});

if (universal._information.mobileConnected) {
	universal.waitForElement(".mobd", (ele) => {
		ele.style.display = "none";
	});
}

const lcfg = universal.getServerStyleFlags();
document.documentElement.style.setProperty(
	"--tile-columns",
	`repeat(${lcfg.tileCols ? lcfg.tileCols : "5"}, 2fr)`,
);

makeThanks(false);
