import EditorViewLogic from "./EditorViewLogic.js";

const type = document.querySelector("#type");
const editorButton = document.querySelector("#editor-btn");

const selectPluginDisabled = document.querySelector('.plugin-actions-disabled');
const selectPluginNotFound = document.querySelector('.plugin-actions-notfound')
const selectPluginDisabledId = document.querySelectorAll('.plugin-actions-disabled-id');
const selectPluginType = document.querySelectorAll(".plugin-actions-notfound-type");
function setDisabledMessageFor(id, type) {
  for(const i of selectPluginDisabledId) i.innerText = id;
  for(const i of selectPluginType) i.innerText = type;
}

class Plugins extends EditorViewLogic {
  constructor() {
    super("plugins", "#*");
  
    this.setOnRun(({interactionData}) => {
      for (const a of document.querySelectorAll(".selectable-plugin-tile-action")) {
        a.style.display = "none";
        a.classList.remove("active");
        if (!interactionData.plugin) continue;
        if (a.dataset.plugin === interactionData.plugin) {
          if (a.dataset.type === interactionData.type) a.classList.add("active");
          a.style.display = "block";
        }
      }
      const allSelectablePluginListers = document.querySelectorAll(".selectable-plugin-lister");
      document.querySelector("#plugin").style.display = "flex";
      document.querySelector('label[for="plugin"]').style.display = "flex";
      selectPluginDisabled.style.display = "none";
      selectPluginNotFound.style.display = "none";
      const selectableItemsOfType = document.querySelectorAll(`.selectable-plugin-tile-action[data-plugin="${universal.cleanHTML(interactionData.plugin)}"]`)
      for (const el of selectableItemsOfType) {
        el.style.display = "block";
      }
      for (const el of allSelectablePluginListers) {
        el.style.display = "none";
      }
      
      setDisabledMessageFor(interactionData.plugin, interactionData.type);
    })

    this.setOnFirstSetup(() => {
      for (const el of document.querySelectorAll(".selectable-plugin-tile-action")) {
        el.style.display = "none";
      }
      for (const el of allSelectablePluginListers) {
        el.style.display = "block";
      }
    })
  }
}

const actionContainer = document.querySelector("#plugin-actions");
const createdIdentifiers = [];

for (const interactionType of universal._matchTypeToPlugin.keys()) {
  if (interactionType.hidden) continue;
  if (!createdIdentifiers.includes(interactionType.pluginId)) {
    const element = document.createElement("div");
    element.classList.add("generic-chip");
    element.classList.add("selectable-plugin-lister");
    element.innerText = interactionType.display;
    element.onclick = (e) => {
      for (const el of document.querySelectorAll(
        `.selectable-plugin-tile-action[data-plugin="${interactionType.pluginId}"]`
      )) {
        el.style.display = "block";
      }

      selectablePluginItemBack.style.display = 'flex';

      for (const el of document.querySelectorAll(".selectable-plugin-lister")) {
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
  element.innerText = `${interactionType.display}: ${interactionType.name}`;
  element.onclick = (e) => {
    const interaction = JSON.parse(
      editorButton.getAttribute("data-interaction")
    );

    const tileToSelect = document.querySelector(
      `.selectable-plugin-tile-action[data-type="${interactionType.type}"][data-plugin="${interactionType.pluginId}"]`
    )

    for(const i of document.querySelectorAll(".selectable-plugin-tile-action")) {
      i.classList.remove("active");
    }
    
    if (interaction.plugin) {
      if (tileToSelect) tileToSelect.classList.remove("active");
    }
    
    interaction.type = interactionType.type;
    interaction.plugin = interactionType.pluginId;
    interaction.renderType = interactionType.renderType;
    interaction.data = { ...interaction.data, ...interactionType.templateData };
    tileToSelect.classList.add("active");
    editorButton.setAttribute("data-interaction", JSON.stringify(interaction));
    document.querySelector("#type").value = interactionType.type;
    loadData(interaction.data);
  };
  actionContainer.appendChild(element);
}

const selectablePluginItemBack = document.querySelector("#select-plugin-back");
const disabledActions = document.querySelector(".plugin-actions-disabled"); 
selectablePluginItemBack.onclick = (e) => {
  disabledActions.style.display = "none";
  for (const el of document.querySelectorAll(".selectable-plugin-tile-action")) {
    el.style.display = "none";
  }
  for (const el of document.querySelectorAll(".selectable-plugin-lister")) {
    el.style.display = "block";
  }
  selectablePluginItemBack.style.display = "none";
};

export default Plugins;