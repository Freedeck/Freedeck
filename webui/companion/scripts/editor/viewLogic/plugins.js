import {
  translateElement,
  translatePage,
} from "../../../../shared/localization.js";
import { loadData } from "../data.js";
import EditorViewLogic from "./EditorViewLogic.js";

class Plugins extends EditorViewLogic {
  constructor() {
    super("plugins", "#*");

    this.typeField = document.querySelector("#type");
    this.editorButton = document.querySelector("#editor-btn");
    this.selectablePluginItemBack = document.querySelector("#select-plugin-back");
    this.editorBackButton = document.querySelector("#editor-back");

    this.existingTypes = new Set();
    this.createdIdentifiers = [];

    // Create Elements Pattern

    this.actionContainer = document.createElement("div");
    this.actionContainer.id = "plugin-actions";
    this.actionContainer.classList.add("generic-chips");
		this.setSectionTitleKey("editor.sections.plugin")
		this.setSectionDescriptionKey("editor.sections.plugin.description")
    // 1. Error View: Plugin Actions Disabled
    this.selectPluginDisabled = document.createElement("div");
    this.selectPluginDisabled.classList.add("plugin-actions-disabled");
    this.selectPluginDisabled.style.display = "none";

    const disabledHeader = document.createElement("h1");
    this.disabledIdSpan1 = document.createElement("span");
    this.disabledIdSpan1.classList.add("plugin-actions-disabled-id");
    const disabledTextSpan = document.createElement("span");
    disabledTextSpan.setAttribute("data-i18n-key", "editor.sections.plugin.actions.disabled");
    disabledHeader.append(this.disabledIdSpan1, disabledTextSpan);

    const advicePara = document.createElement("p");
    const adviceTextSpan = document.createElement("span");
    adviceTextSpan.setAttribute("data-i18n-key", "editor.sections.plugin.actions.disabled.advice");
    this.disabledIdSpan2 = document.createElement("span");
    this.disabledIdSpan2.classList.add("plugin-actions-disabled-id");
    advicePara.append(adviceTextSpan, this.disabledIdSpan2, document.createTextNode("."));
    const exitPara = document.createElement("p");
    exitPara.setAttribute("data-i18n-key", "editor.sections.plugin.actions.disabled.exit_info");

    this.selectPluginDisabled.append(disabledHeader, advicePara, exitPara);
    this.actionContainer.appendChild(this.selectPluginDisabled);

    // 2. Error View: Plugin Type Not Found
    this.selectPluginNotFound = document.createElement("div");
    this.selectPluginNotFound.classList.add("plugin-actions-notfound");
    this.selectPluginNotFound.style.display = "none";

    const notFoundHeader = document.createElement("h2");
    const notFoundTextSpan = document.createElement("span");
    notFoundTextSpan.setAttribute("data-i18n-key", "editor.sections.plugin.actions.type.not_found");
    this.notFoundTypeSpan = document.createElement("span");
    this.notFoundTypeSpan.classList.add("plugin-actions-notfound-type");
    notFoundHeader.append(notFoundTextSpan, this.notFoundTypeSpan);

    const reloadPara = document.createElement("p");
    const reloadTextSpan = document.createElement("span");
    reloadTextSpan.setAttribute("data-i18n-key", "editor.sections.plugin.actions.type.reload");
    this.disabledIdSpan3 = document.createElement("span");
    this.disabledIdSpan3.classList.add("plugin-actions-disabled-id");
    reloadPara.append(reloadTextSpan, this.disabledIdSpan3, document.createTextNode("."));

    this.selectPluginNotFound.append(notFoundHeader, reloadPara);
    this.actionContainer.appendChild(this.selectPluginNotFound);

    this.setElementsToAdd(() => {
      return [this.actionContainer];
    });

    this.setOnRun(({ interactionData }) => {
      this.setupListers();
      for (const a of document.querySelectorAll(".selectable-plugin-tile-action")) {
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
      this.selectPluginDisabled.style.display = "none";
      this.selectPluginNotFound.style.display = "none";
      
      const typeExists = this.existingTypes.has(interactionData.type);
      const allSelectablePluginListers = document.querySelectorAll(".selectable-plugin-lister");
      const selectableItemsOfType = document.querySelectorAll(
        `.selectable-plugin-tile-action[data-plugin="${universal.cleanHTML(interactionData.plugin)}"]`
      );

      if (typeExists) {
        for (const el of selectableItemsOfType) {
          el.style.display = "block";
        }
        for (const el of allSelectablePluginListers) {
          el.style.display = "none";
        }
        this.selectablePluginItemBack.style.display = "flex";
        this.editorBackButton.style.display = "none";
        this.setDisabledMessageFor(interactionData.plugin, interactionData.type);
      } else {
        for (const el of document.querySelectorAll(".selectable-plugin-tile-action")) {
          el.style.display = "none";
        }
        for (const el of document.querySelectorAll(".selectable-plugin-lister")) {
          el.style.display = "block";
        }
        if (window.disabledActions) window.disabledActions.style.display = "none";
        this.selectablePluginItemBack.style.display = "none";
        this.editorBackButton.style.display = "flex";
        
        if (interactionData.type !== undefined && interactionData.type !== null) {
          for (const el of allSelectablePluginListers) {
            el.style.display = "none";
          }
          if (
            !document.querySelector(
              `.selectable-plugin-tile-action[data-plugin="${universal.cleanHTML(interactionData.plugin)}"][data-type="${universal.cleanHTML(interactionData.type)}"]`
            )
          ) {
            this.selectPluginNotFound.style.display = "flex";
            this.selectablePluginItemBack.style.display = "flex";
            this.editorBackButton.style.display = "none";
            for (const el of selectableItemsOfType) {
              el.style.display = "block";
            }
          }
          if (!universal.plugins[interactionData.plugin.toLowerCase()]) {
            if (window.disabledActions) window.disabledActions.style.display = "flex";
            this.selectPluginDisabled.style.display = "flex";
          }
          this.setDisabledMessageFor(interactionData.plugin, interactionData.type);
        }
      }
    });

    this.setOnFirstSetup(() => {
      this.editorBackButton.style.display = "flex";
      this.selectPluginDisabled.style.display = "none";
      this.selectPluginNotFound.style.display = "none";
      const allSelectablePluginListers = document.querySelectorAll(".selectable-plugin-lister");
      for (const el of document.querySelectorAll(".selectable-plugin-tile-action")) {
        el.style.display = "none";
      }
      this.selectablePluginItemBack.style.display = "none";
      for (const el of allSelectablePluginListers) {
        el.style.display = "block";
      }

      this.setupListers();
    });
  }

  setDisabledMessageFor(id, type) {
    this.disabledIdSpan2.innerText = id;
    this.disabledIdSpan1.innerText = id;
    this.notFoundTypeSpan.innerText = type;
  }

  setupListers() {
    if (this.existingTypes.size === 0) {
      const actionContainer = document.querySelector("#plugin-actions");
      
      for (const interactionType of universal._matchTypeToPlugin.keys()) {
        this.existingTypes.add(interactionType.type);
        if (interactionType.hidden) continue;
        
        if (!this.createdIdentifiers.includes(interactionType.pluginId)) {
          const element = document.createElement("div");
          element.classList.add("generic-chip", "selectable-plugin-lister");
          element.innerText = interactionType.display;
          element.onclick = (e) => {
            for (const el of document.querySelectorAll(`.selectable-plugin-tile-action[data-plugin="${interactionType.pluginId}"]`)) {
              el.style.display = "block";
            }

            this.selectablePluginItemBack.style.display = "flex";
            this.editorBackButton.style.display = "none";

            for (const el of document.querySelectorAll(".selectable-plugin-lister")) {
              el.style.display = "none";
            }
          };
          actionContainer.appendChild(element);
          this.createdIdentifiers.push(interactionType.pluginId);
        }

        const element = document.createElement("div");
        element.classList.add("generic-chip", "selectable-plugin-tile-action");
        element.setAttribute("data-type", interactionType.type);
        element.setAttribute("data-plugin", interactionType.pluginId);
        element.innerText = `${interactionType.name}`;
        element.onclick = (e) => {
          const interaction = JSON.parse(this.editorButton.getAttribute("data-interaction"));
          const tileToSelect = document.querySelector(
            `.selectable-plugin-tile-action[data-type="${interactionType.type}"][data-plugin="${interactionType.pluginId}"]`
          );

          for (const i of document.querySelectorAll(".selectable-plugin-tile-action")) {
            i.classList.remove("active");
          }

          if (interaction.plugin && tileToSelect) {
            tileToSelect.classList.remove("active");
          }

          interaction.type = interactionType.type;
          interaction.plugin = interactionType.pluginId;
          interaction.renderType = interactionType.renderType;
          interaction.data = {
            ...interaction.data,
            ...interactionType.templateData,
          };
          
          tileToSelect.classList.add("active");
          this.editorButton.setAttribute("data-interaction", JSON.stringify(interaction));
          this.typeField.value = interactionType.type;
          loadData(interaction.data);
        };
        actionContainer.appendChild(element);
      }

      this.selectablePluginItemBack.onclick = (e) => {
        if (window.disabledActions) window.disabledActions.style.display = "none";
        for (const el of document.querySelectorAll(".selectable-plugin-tile-action")) {
          el.style.display = "none";
        }
        for (const el of document.querySelectorAll(".selectable-plugin-lister")) {
          el.style.display = "block";
        }
        this.selectablePluginItemBack.style.display = "none";
        this.editorBackButton.style.display = "flex";
      };
    }
  }
}

export default Plugins;