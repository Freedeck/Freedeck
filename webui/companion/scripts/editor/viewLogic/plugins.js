import {
	translateElement,
	translatePage,
} from "../../../../shared/localization.js";
import { loadData } from "../data.js";
import EditorViewLogic from "./EditorViewLogic.js";

const type = document.querySelector("#type");
const editorButton = document.querySelector("#editor-btn");

const selectPluginDisabled = document.querySelector(".plugin-actions-disabled");
const selectPluginNotFound = document.querySelector(".plugin-actions-notfound");
const selectPluginDisabledId = document.querySelectorAll(
	".plugin-actions-disabled-id",
);
const selectPluginType = document.querySelectorAll(
	".plugin-actions-notfound-type",
);
function setDisabledMessageFor(id, type) {
	for (const i of selectPluginDisabledId) i.innerText = id;
	for (const i of selectPluginType) i.innerText = type;
}

const selectablePluginItemBack = document.querySelector("#select-plugin-back");
const disabledActions = document.querySelector(".plugin-actions-disabled");

const existingTypes = new Set();
class Plugins extends EditorViewLogic {
	constructor() {
		super("plugins", "#*");

		this.setOnRun(({ interactionData }) => {
			setupListers();
			for (const a of document.querySelectorAll(
				".selectable-plugin-tile-action",
			)) {
				a.style.display = "none";
				a.classList.remove("active");
				if (!interactionData.plugin) continue;
				if (a.dataset.plugin === interactionData.plugin) {
					if (a.dataset.type === interactionData.type)
						a.classList.add("active");
					a.style.display = "block";
				}
			}
			document.querySelector("#plugin").style.display = "flex";
			document.querySelector('label[for="plugin"]').style.display = "flex";
			selectPluginDisabled.style.display = "none";
			selectPluginNotFound.style.display = "none";
			const typeExists = existingTypes.has(interactionData.type);
			const allSelectablePluginListers = document.querySelectorAll(
				".selectable-plugin-lister",
			);
			const selectableItemsOfType = document.querySelectorAll(
				`.selectable-plugin-tile-action[data-plugin="${universal.cleanHTML(interactionData.plugin)}"]`,
			);
			if (typeExists) {
				for (const el of selectableItemsOfType) {
					el.style.display = "block";
				}
				for (const el of allSelectablePluginListers) {
					el.style.display = "none";
				}

				setDisabledMessageFor(interactionData.plugin, interactionData.type);
			} else {
				for (const el of document.querySelectorAll(
					".selectable-plugin-tile-action",
				)) {
					el.style.display = "none";
				}
				for (const el of document.querySelectorAll(
					".selectable-plugin-lister",
				)) {
					el.style.display = "block";
				}
				disabledActions.style.display = "none";
				selectablePluginItemBack.style.display = "none";
				if (
					interactionData.type !== undefined ||
					interactionData.type !== null
				) {
					for (const el of allSelectablePluginListers) {
						el.style.display = "none";
					}
					if (
						!document.querySelector(
							`.selectable-plugin-tile-action[data-plugin="${universal.cleanHTML(interactionData.plugin)}"][data-type="${universal.cleanHTML(interactionData.type)}"]`,
						)
					) {
						selectPluginNotFound.style.display = "flex";
						selectablePluginItemBack.style.display = "flex";
						for (const el of selectableItemsOfType) {
							el.style.display = "block";
						}
					}
					if (!universal.plugins[interactionData.plugin.toLowerCase()]) {
						disabledActions.style.display = "flex";
						selectPluginDisabled.style.display = "flex";
					}
					setDisabledMessageFor(interactionData.plugin, interactionData.type);
				}
			}
		});

		this.setOnFirstSetup(() => {
			selectPluginDisabled.style.display = "none";
			selectPluginNotFound.style.display = "none";
			const allSelectablePluginListers = document.querySelectorAll(
				".selectable-plugin-lister",
			);
			for (const el of document.querySelectorAll(
				".selectable-plugin-tile-action",
			)) {
				el.style.display = "none";
			}
			for (const el of allSelectablePluginListers) {
				el.style.display = "block";
			}

			setupListers();
		});
	}
}

function setupListers() {
	if (existingTypes.size === 0) {
		const actionContainer = document.querySelector("#plugin-actions");
		const createdIdentifiers = [];
		for (const interactionType of universal._matchTypeToPlugin.keys()) {
			existingTypes.add(interactionType.type);
			if (interactionType.hidden) continue;
			if (!createdIdentifiers.includes(interactionType.pluginId)) {
				const element = document.createElement("div");
				element.classList.add("generic-chip");
				element.classList.add("selectable-plugin-lister");
				element.innerText = interactionType.display;
				element.onclick = (e) => {
					for (const el of document.querySelectorAll(
						`.selectable-plugin-tile-action[data-plugin="${interactionType.pluginId}"]`,
					)) {
						el.style.display = "block";
					}

					selectablePluginItemBack.style.display = "flex";

					for (const el of document.querySelectorAll(
						".selectable-plugin-lister",
					)) {
						el.style.display = "none";
					}
				};
				actionContainer.appendChild(element);
				createdIdentifiers.push(interactionType.pluginId);
			}
			const element = document.createElement("div");
			element.classList.add("generic-chip");
			element.classList.add("selectable-plugin-tile-action");
			element.setAttribute("data-type", interactionType.type);
			element.setAttribute("data-plugin", interactionType.pluginId);
			element.innerText = `${interactionType.name}`;
			element.onclick = (e) => {
				const interaction = JSON.parse(
					editorButton.getAttribute("data-interaction"),
				);

				const tileToSelect = document.querySelector(
					`.selectable-plugin-tile-action[data-type="${interactionType.type}"][data-plugin="${interactionType.pluginId}"]`,
				);

				for (const i of document.querySelectorAll(
					".selectable-plugin-tile-action",
				)) {
					i.classList.remove("active");
				}

				if (interaction.plugin) {
					if (tileToSelect) tileToSelect.classList.remove("active");
				}

				interaction.type = interactionType.type;
				interaction.plugin = interactionType.pluginId;
				interaction.renderType = interactionType.renderType;
				interaction.data = {
					...interaction.data,
					...interactionType.templateData,
				};
				tileToSelect.classList.add("active");
				editorButton.setAttribute(
					"data-interaction",
					JSON.stringify(interaction),
				);
				document.querySelector("#type").value = interactionType.type;
				loadData(interaction.data);
			};
			actionContainer.appendChild(element);
		}

		selectablePluginItemBack.onclick = (e) => {
			disabledActions.style.display = "none";
			for (const el of document.querySelectorAll(
				".selectable-plugin-tile-action",
			)) {
				el.style.display = "none";
			}
			for (const el of document.querySelectorAll(".selectable-plugin-lister")) {
				el.style.display = "block";
			}
			selectablePluginItemBack.style.display = "none";
		};
	}
}

export default Plugins;
