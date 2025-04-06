import { UI } from "../../client/scripts/ui.js";
import { universal } from "../../shared/universal.js";
import {openViewTop, closeAllViews} from "./editor/viewEngine.js";
import {loadData, setTileData} from "./editor/data.js";
import "./sidebar.js";
import "../../shared/useAuthentication.js"; // Only for authenticated pages
import "./uploadsHandler.js";
import "./editor/loader.js";
import "./contextMenu.js";
import { makeThanks } from "./changelog/create.js";
import Sound from "./editor/viewLogic/sound.js";
import System from "./editor/viewLogic/system.js";
import EditorViewLogic from "./editor/viewLogic/EditorViewLogic.js";
import Macro from "./editor/viewLogic/macro.js";
import Profile from "./editor/viewLogic/profile.js";
import "./dragHandler.js";

await universal.init("Companion");

universal.connectionTest = true;

const editorButton = document.querySelector("#editor-btn");
const editorContainer = document.querySelector("#editor");
const editorDiv = document.querySelector("#editor-div");

const leftSidebar = document.querySelector(".sidebar");
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

const editorViewLogics = new Map(
  [
    ["audio", new Sound()],
    ["system", new System()],
    ["plugin", new EditorViewLogic()],
    ["macro", new Macro()],
    ["profile", new Profile()],
    ["none", new EditorViewLogic()],
  ]
)

/**
 * Edit a tile
 * @param {*} e HTML Element corresponding to the button that we grabbed context from
 */
function editTile(e) {
  universal.uiSounds.playSound("editor_open");
  const interactionData = JSON.parse(
    e.srcElement.getAttribute("data-interaction")
  );
  editorButton.dataset.state = "init";
  universal.keys.classList.add("smaller")
  for(const el of document.querySelectorAll(".k")) {
    el.classList.add("smaller");
    el.classList.add("blur");
  }
  const realEle = document.querySelector(`.k[data-interaction='${e.srcElement.getAttribute("data-interaction")}']`);
  realEle.classList.remove("smaller");

  if (document.querySelector(".contextMenu"))
    document.querySelector(".contextMenu").style.display = "none";
  for (const el of document.querySelectorAll(".plugin-view")) {
    el.style.display = "none";
  }
  document.querySelector("#advanced-view").style.display = "none";
  
  editorContainer.style.display = "block";

  editorButton.setAttribute("data-pre-edit", e.srcElement.dataset.name);
  editorButton.setAttribute(
    "data-interaction",
    e.srcElement.getAttribute("data-interaction")
  );
  for (const a of document.querySelectorAll(".spiaction")) {
    a.style.display = "none";
    a.classList.remove("spi-active");
    if (!interactionData.plugin) continue;
    if (a.dataset.plugin === interactionData.plugin) {
      if (a.dataset.type === interactionData.type)
        a.classList.add("spi-active");
      a.style.display = "block";
    }
  }

  if (interactionData.plugin === "Freedeck" || !interactionData.plugin) {
    document.querySelector("#plugin").style.display = "none";
    document.querySelector('label[for="plugin"]').style.display = "none";
  } else {
    document.querySelector('label[for="plugin"]').style.display = "block";
    document.querySelector("#plugin").style.display = "block";
    document.querySelector("#plugin").value =
      interactionData.plugin || "Freedeck";
  }
  document.querySelector("#editor-back").style.display = "block";
  
  closeAllViews();
  document.querySelector(".spi-actions-disabled").style.display = "none";
  document.querySelector(".spi-actions-notfound").style.display = "none";

  if (!interactionData.type.startsWith("fd.")) {
    for (const el of document.querySelectorAll(".spiaction")) {
      if (el.classList.contains(`pl-${interactionData.plugin}`))
        el.style.display = "block";
    }
    for (const el of document.querySelectorAll(".spiback")) {
      el.style.display = "block";
    }
    for (const el of document.querySelectorAll(".spiplugin")) {
      el.style.display = "none";
    }

    for (const el of document.querySelectorAll(".spi-actions-disabled-id")) {
      el.innerText = interactionData.plugin;
    }
    for (const el of document.querySelectorAll(
      ".spi-actions-notfound-type"
    )) {
      el.innerText = interactionData.type;
    }
    if (
      !document.querySelector(`.spi[data-type="${interactionData.type}"]`)
    ) {
      document.querySelector(".spi-actions-notfound").style.display = "block";
    }
    if (universal.plugins[interactionData.plugin] === undefined) {
      document.querySelector(".spi-actions-disabled").style.display = "block";
    }
    openViewTop("plugins");
  } else {
    for (const el of document.querySelectorAll(".spiaction, .spiback")) {
      el.style.display = "none";
    }
    for (const el of document.querySelectorAll(".spiplugin")) {
      el.style.display = "block";
    }
  }
  if (interactionData.type === "fd.none" && !interactionData.data._view) {
    openViewTop("none");
    document.querySelector("#editor-back").style.display = "none";
  } else {
    for(const v of editorViewLogics) {
      v[1].forwardRunningEvent(interactionData.type, () => {
        openViewTop(v[1].view);
      }, {interactionData});
    }
  } 
  
  if (interactionData.plugin) {
    loadSettings(interactionData.plugin);
  }
  if (interactionData.data) {
    const itm = interactionData.data;
    loadData(itm);
  }

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

  setCheck("#orl", "onRelease", interactionData);
  setCheck("#lp", "longPress", interactionData);
  setCheck("#sbg", "showBg", interactionData);
  setCheck("#nbo", "noBorder", interactionData);
  setCheck("#nbr", "noRounding", interactionData);
  setCheck("#nsh", "noShadow", interactionData);

  document.querySelector("#lp").style.display =
    interactionData.renderType === "slider" ? "none" : "block";
  document.querySelector('label[for="lp"]').style.display =
    interactionData.renderType === "slider" ? "none" : "block";
  // make it fade in
  editorDiv.style.animationName ="editor-pull-down";
  universal.keys.parentElement.style.transform = "translate(-50%, -115%)" 
  toggleSidebarButton.style.display = "none";

  universal.sendEvent("editTile", interactionData, e.srcElement.dataset.name);
}

universal.editTile = editTile;

document.querySelector("#editor-back").onclick = () => {
  document.querySelector("#editor-back").style.display = "none";
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
createEditorCheckbox("#nsh", "noShadow");
createEditorCheckbox("#orl", "onRelease");
createEditorCheckbox("#lp", "longPress");

document.querySelector("#change-pl-settings").onclick = () => {
  const plugin = document.querySelector("#plugin").value;
  const settings = {};
  for (const el of document.querySelectorAll(".pl-settings-item")) {
    const key = el.querySelector("div").innerText;
    if (el.querySelector(".pl-settings-array")) {
      const array = [];
      for (const item of el.querySelectorAll(".pl-settings-array input")) {
        array.push(item.value);
      }
      settings[key] = array;
    } else {
      settings[key] = el.querySelector("input").value;
    }
  }
  universal.send(universal.events.companion.plugin_set_all, {
    plugin,
    settings,
  });
};

const loadSettings = (plugin) => {
  const settingsElement = document.querySelector("#pl-settings");
  settingsElement.innerHTML = "";
  document.querySelector("#pl-title").innerText = "Plugin Settings";
  if (!universal.plugins[plugin]) {
    settingsElement.innerHTML =
      "<h2>The plugin for this Tile is missing.</h2><p>Please re-enable or download it.</p>";
    document.querySelector("#change-pl-settings").style.display = "none";
    return;
  }
  document.querySelector("#change-pl-settings").style.display = "block";
  document.querySelector(
    "#pl-title"
  ).innerText = `${universal.plugins[plugin].name} Settings`;
  const settings = universal.plugins[plugin].Settings;
  for (const key of Object.keys(settings)) {
    const value = settings[key];
    const container = document.createElement("div");
    container.classList.add("pl-settings-item");
    const title = document.createElement("div");
    title.innerText = key;
    container.appendChild(title);
    if (Array.isArray(value) || typeof value === "object") {
      const arrayContainer = document.createElement("div");
      arrayContainer.classList.add("pl-settings-array");
      let i = 0;
      for (const val of value) {
        const item = document.createElement("input");
        item.type = key !== "password" || key !== "token" ? "text" : "password";
        item.id = key;
        item.dataset.index = i;
        item.value = val;
        arrayContainer.appendChild(item);
        i++;
      }
      container.appendChild(arrayContainer);
    } else {
      const item = document.createElement("input");
      item.type = key !== "password" || key !== "token" ? "text" : "password";
      item.id = key;
      item.value = value;
      container.appendChild(item);
    }
    settingsElement.appendChild(container);
  }
};

const generateProfileSelect = () => {
  const select = document.querySelector("#eprofile-select");
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
universal.generateProfileSelect = generateProfileSelect;

document.querySelector("#spiback").onclick = (e) => {
  document.querySelector(".spi-actions-disabled").style.display = "none";
  for (const el of document.querySelectorAll(".spiaction, .spiback")) {
    el.style.display = "none";
  }
  for (const el of document.querySelectorAll(".spiplugin")) {
    el.style.display = "block";
  }
};

document.querySelector("#spiav").onclick = () => {
  const interaction = JSON.parse(editorButton.getAttribute("data-interaction"));
  if (!interaction.data || Object.keys(interaction.data).length === 0) {
    document.querySelector("#tiledata").style.display = "none";
  } else {
    document.querySelector("#tiledata").style.display = "flex";
  }
  if (document.querySelector("#advanced-view").style.display === "block")
    document.querySelector("#advanced-view").style.display = "none";
  else document.querySelector("#advanced-view").style.display = "block";
};

const spiContainer = document.querySelector("#spi-actions");
for (const type of universal._tyc.keys()) {
  if (!document.querySelector(`.rpl-${type.pluginId}`)) {
    if(type.hidden) continue;
    const element = document.createElement("div");
    element.classList.add(`rpl-${type.pluginId}`);
    element.classList.add("plugin-item");
    element.classList.add("spi");
    element.classList.add("spiplugin");
    element.innerText = type.display;
    element.onclick = (e) => {
      for (const el of document.querySelectorAll(
        `.spiaction.pl-${type.pluginId}`
      )) {
        el.style.display = "block";
      }

      for (const el of document.querySelectorAll(".spiback")) {
        el.style.display = "block";
      }

      for (const el of document.querySelectorAll(".spiplugin")) {
        el.style.display = "none";
      }
    };
    spiContainer.appendChild(element);
  }
  const element = document.createElement("div");
  element.classList.add(`pl-${type.pluginId}`);
  element.classList.add("plugin-item");
  element.classList.add("spi");
  element.classList.add("spiaction");
  element.setAttribute("data-type", type.type);
  element.setAttribute("data-plugin", type.pluginId);
  element.setAttribute("data-rt", type.renderType);
  element.setAttribute("data-template", JSON.stringify(type.templateData));
  element.innerText = `${type.display}: ${type.name}`;
  element.onclick = (e) => {
    const interaction = JSON.parse(
      editorButton.getAttribute("data-interaction")
    );
    const type = e.target.getAttribute("data-type");
    const plugin = e.target.getAttribute("data-plugin");
    const renderType = e.target.getAttribute("data-rt");
    const templateData = JSON.parse(e.target.getAttribute("data-template"));

    if (interaction.plugin) {
      if (
        document.querySelector(
          `.spi[data-type="${interaction.type}"][data-plugin="${interaction.plugin}"]`
        )
      )
        document
          .querySelector(
            `.spi[data-type="${interaction.type}"][data-plugin="${interaction.plugin}"]`
          )
          .classList.remove("spi-active");
    }
    interaction.type = type;
    interaction.plugin = plugin;
    interaction.renderType = renderType;
    interaction.data = { ...interaction.data, ...templateData };
    document
      .querySelector(`.spi[data-type="${type}"][data-plugin="${plugin}"]`)
      .classList.add("spi-active");
    editorButton.setAttribute("data-interaction", JSON.stringify(interaction));
    document.querySelector("#type").value = type;
    document.querySelector("#plugin").value = plugin;
    loadData(interaction.data);
    loadSettings(interaction.plugin);
  };
  spiContainer.appendChild(element);
}
generateProfileSelect();

document.querySelector("#upload-sound").onclick = () => {
  document.querySelector("#upload-sound").disabled = true;
  universal.uiSounds.playSound("int_confirm");
  const ito = JSON.parse(editorButton.dataset.interaction);

  universal._Uploads_View = 0;
  universal.vopen("library");
  universal._libraryOnload = () => {
    setupLibraryFor("sound");
  };
  universal._libraryOnpaint = () => {
    if (
      ito.data.file &&
      document.querySelector(`.upload[data-name='${ito.data.file}']`)
    )
      document
        .querySelector(`.upload[data-name='${ito.data.file}']`)
        .classList.add("glow");
    for (const el of document.querySelectorAll(".uploads-0 .upload")) {
      el.onclick = () => {
        for (const el of document.querySelectorAll(".upload")) {
          el.classList.remove("glow");
        }
        el.classList.add("glow");
        universal._Uploads_Select(el.dataset.name);
      };
    }
    document.querySelector(".save-changes").onclick = () => {
      universal._libraryOnload = () => {
        setupLibraryFor("");
      };
      universal._libraryOnpaint = undefined;
      universal.vopen("index.html");
    };
  };
  universal._Uploads_Select = (itm) => {
    const interaction = JSON.parse(
      editorButton.getAttribute("data-interaction")
    );
    interaction.data.file = itm;
    interaction.data.path = "/sounds/";
    editorButton.setAttribute("data-interaction", JSON.stringify(interaction));
    loadData(interaction.data);
    document.querySelector("#file.editor-data").value = itm;
    document.querySelector("#path.editor-data").value = "/sounds/";
    document.querySelector("#audio-file").innerText = itm;
    // document.querySelector("#audio-path").innerText = "/sounds/";

    universal.uiSounds.playSound("int_yes");
  };
};

editorViewLogics.forEach((logic, k) => {
  console.log("Setting up", k);
  if(!document.querySelector(`#none-${k}`)) return;
  document.querySelector(`#none-${k}`).onclick = (e) => {
    e.preventDefault();
    openViewTop(k);
    logic.onFirstSetup({
      interactionData: JSON.parse(editorButton.getAttribute("data-interaction")),
    })
  };
})


universal.nbws.on("apps", (rawData) => {
  const data = rawData;
  const int = JSON.parse(editorButton.getAttribute("data-interaction"));
  const select = document.querySelector("#system-select");
  select.innerHTML = "";

  for (const app of data) {
    const option = document.createElement("option");
    let friendly =
      app.friendly !== "" ? `${app.friendly} (${app.name})` : app.name;
    if (app.name === "_fd.System") friendly = "System Volume";
    option.innerText = friendly;
    option.value = app.name;
    if (int?.data?.app && int.data.app === app.name) option.selected = true;
    select.appendChild(option);
  }

  select.onchange = (e) => {
    const int = JSON.parse(editorButton.getAttribute("data-interaction"));
    const dt =
      e.srcElement.value !== "_fd.System"
        ? "fd.sys.volume"
        : "fd.sys.volume.sys";
    document.querySelector("#type").value = dt;
    int.type = dt;
    int.renderType = "slider";
    setTileData("app", e.srcElement.value, int);
    setTileData("min", 0, int);
    setTileData("max", 100, int);
    setTileData("value", 50, int);
    setTileData("format", "%", int);
    setTileData("direction", "vertical", int);
    editorButton.setAttribute("data-interaction", JSON.stringify(int));
  };
});

document.querySelector("#macro-macro").onchange = (e) => {
  const int = JSON.parse(editorButton.getAttribute("data-interaction"));
  setTileData("macro", e.srcElement.value, int);
  int.data.macro = e.srcElement.value;
};
document.querySelector("#macro-type").onchange = (e) => {
  const int = JSON.parse(editorButton.getAttribute("data-interaction"));
  int.type = e.srcElement.value === "text" ? "fd.macro_text" : "fd.macro";
  document.querySelector("#type").innerText = int.type;
  editorButton.setAttribute("data-interaction", JSON.stringify(int));
};

document.querySelector("#none-plugin").onclick = (e) => {
  document.querySelector('label[for="plugin"]').style.display = "block";
  document.querySelector("#plugin").style.display = "block";
  const int = JSON.parse(editorButton.getAttribute("data-interaction"));
  int.type = "fd.select";
  document.querySelector("#type").innerText = "fd.select";
  editorButton.setAttribute("data-interaction", JSON.stringify(int));
  openViewTop("plugins");
};

function setupLibraryFor(type){
  if (type === "icon") {
    document.querySelector("#library-view-sounds").style.display = "none";
    document.querySelector("#library-view-icons").style.display = "block";
    document.querySelector("#library-view-sounds").open = false;
    document.querySelector("#library-view-icons").open = true;
    document.querySelector(".uploads-0").style.display = "none";
    document.querySelector("#uploads-0-title").style.display = "none";
    document.querySelector(".uploads-1").style.display = "flex";
    document.querySelector("#uploads-1-title").style.display = "block";
    document.querySelector("#library > body> center p").textContent =
      "Select an icon to use, or upload a new one!";
    document.querySelector("#library > body> h1").textContent =
      "Available Icons";
    document.querySelector(".save-changes").style.display = "block";
  } else if (type === "sound") {
    document.querySelector("#library-view-sounds").style.display = "block";
    document.querySelector("#library-view-icons").style.display = "none";
    document.querySelector("#library-view-sounds").open = true;
    document.querySelector("#library-view-icons").open = false;
    document.querySelector(".uploads-0").style.display = "flex";
    document.querySelector("#uploads-0-title").style.display = "block";
    document.querySelector(".uploads-1").style.display = "none";
    document.querySelector("#uploads-1-title").style.display = "none";
    document.querySelector("#library > body> center p").textContent =
      "Select an sound to use, or upload a new one!";
    document.querySelector("#library > body> h1").textContent =
      "Available Sounds";
    document.querySelector(".save-changes").style.display = "block";
  } else {
    document.querySelector("#library-view-sounds").style.display = "block";
    document.querySelector("#library-view-icons").style.display = "block";
    document.querySelector("#library-view-sounds").open = false;
    document.querySelector("#library-view-icons").open = false;
    document.querySelector(".uploads-0").style.display = "flex";
    document.querySelector("#uploads-0-title").style.display = "block";
    document.querySelector(".uploads-1").style.display = "flex";
    document.querySelector("#uploads-1-title").style.display = "block";
    document.querySelector("#library > body> center p").textContent =
      "Here you will find every sound or icon you've uploaded.";
    document.querySelector("#library > body> h1").textContent = "Library";
    document.querySelector(".save-changes").style.display = "none";
  }
};

document.querySelector("#upload-icon").onclick = (e) => {
  universal.uiSounds.playSound("int_confirm");
  universal._Uploads_View = 1;
  universal.vopen("library");
  const ito = JSON.parse(editorButton.dataset.interaction);
  universal._libraryOnload = () => {
    setupLibraryFor("icon");
  };
  universal._libraryOnpaint = () => {
    if (
      ito.data.icon &&
      document.querySelector(
        `.upload[data-name='${ito.data.icon.split("/icons/")[1]}']`
      )
    )
      document
        .querySelector(
          `.upload[data-name='${ito.data.icon.split("/icons/")[1]}']`
        )
        .classList.add("glow");
    for (const el of document.querySelectorAll(".uploads-1 .upload")) {
      el.onclick = () => {
        for (const el of document.querySelectorAll(".upload")) {
          el.classList.remove("glow");
        }
        el.classList.add("glow");
        universal._Uploads_Select(el.dataset.name);
      };
    }
    document.querySelector(".save-changes").onclick = () => {
      universal._libraryOnload = () => {
        setupLibraryFor("");
      };
      universal._libraryOnpaint = undefined;
      universal.vopen("index.html");
    };
  };
  universal._Uploads_Select = (itm) => {
    const interaction = JSON.parse(
      editorButton.getAttribute("data-interaction")
    );
    interaction.data.icon = `/icons/${itm}`;
    editorButton.setAttribute("data-interaction", JSON.stringify(interaction));
    editorButton.style.backgroundImage = `url("${`/icons/${itm}`}")`;
    loadData(interaction.data);
    universal.uiSounds.playSound("uploaded");
  };
};

/**
 * Create a text input modal.
 * @param {String} title The title of the modal
 * @param {String} content The placeholder text for the input
 * @param {void} callback What to do when submitted
 */
function showEditModal(title, content, callback) {
  const modal = document.createElement("div");
  modal.className = "modal";

  const modalContent = document.createElement("div");
  modalContent.className = "modalContent";

  const modalClose = document.createElement("button");
  modalClose.innerText = "Close";
  modalClose.classList.add("modalClose");
  modalClose.onclick = () => {
    modal.remove();
  };
  modalContent.appendChild(modalClose);

  const modalTitle = document.createElement("h2");
  modalTitle.innerText = title;
  modalTitle.classList.add("modalTitle");
  modalContent.appendChild(modalTitle);

  const modalFeedback = document.createElement("div");
  modalFeedback.classList.add("modalFeedback");
  modalContent.appendChild(modalFeedback);

  const modalInput = document.createElement("input");
  modalInput.type = "text";
  modalInput.placeholder = content;
  modalInput.classList.add("modalInput_text");
  modalContent.appendChild(modalInput);

  const modalButton = document.createElement("button");
  modalButton.innerText = "Save";
  modalButton.onclick = () => {
    const returned = callback(
      modal,
      modalInput.value,
      modalFeedback,
      modalTitle,
      modalButton,
      modalInput,
      modalContent
    );
    if (returned === false) return;
    modal.remove();
  };
  modalContent.appendChild(modalButton);

  modal.appendChild(modalContent);

  document.body.appendChild(modal);
}

function showText(title, content, callback, closable = true) {
  const modal = document.createElement("div");
  modal.className = "modal";

  const modalContent = document.createElement("div");
  modalContent.classList.add("modalContent");

  if (closable) {
    const modalClose = document.createElement("button");
    modalClose.innerText = "Close";
    modalClose.classList.add("modalClose");
    modalClose.onclick = () => {
      modal.remove();
    };
    modalContent.appendChild(modalClose);
  }

  const modalTitle = document.createElement("h2");
  modalTitle.innerText = title;
  modalTitle.classList.add("modalTitle");
  modalContent.appendChild(modalTitle);

  const modalTextContent = document.createElement("div");
  modalTextContent.innerText = content;
  modalTextContent.classList.add("modalTextContent");
  modalContent.appendChild(modalTextContent);

  const modalButton = document.createElement("button");
  modalButton.innerText = "Next";
  modalButton.onclick = () => {
    modal.remove();
    callback();
  };
  modalContent.appendChild(modalButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  universal.uiSounds.playSound("int_prompt");
  return modal;
}

/**
 * Create a list picker modal.
 * @param {String} title The title of the modal
 * @param {Array} listContent The content of the list
 * @param {void} callback What to do when submitted
 */
function showPick(
  title,
  listContent,
  callback,
  extraM = "",
  closable = true
) {
  const modalFeedback = document.createElement("div");
  modalFeedback.classList.add("modalFeedback");
  
  const modalList = document.createElement("select");
  modalList.className = "modalList";
  modalList.style.marginBottom = "20px";

  const modal = UI.makeGenericModal(title, extraM, [{
    text: "Save",
    onclick: () => {
      const selectedItem = modalList.options[modalList.selectedIndex];
      const value = JSON.parse(selectedItem.value);
      const returned = callback(
       {
        modal,
        value,
        modalFeedback,
        modalContent
       }
      );
      if (returned === false) return;
      modal.close();
    },
  }], closable);

  const modalContent = modal.content;

  modalContent.appendChild(modalFeedback);
  modalContent.appendChild(modalList);

  for (const item of listContent) {
    const modalItem = document.createElement("option");
    modalItem.className = "modalItem";
    modalItem.setAttribute("value", JSON.stringify(item));
    modalItem.innerText = item.name || item.display;
    modalList.appendChild(modalItem);
  }

  document.body.appendChild(modal.modal);
  universal.uiSounds.playSound("int_prompt");
  return modal;
}

function showYesNo(title, content, yesCallback, closable = true) {
  const modal = universal.UI.makeGenericModal(title, content, [], closable);
  const modalContent = modal.content;

  const yesnoc = document.createElement("div");
  yesnoc.classList.add("flex-wrap-r");

  const modalButton = document.createElement("button");
  modalButton.innerText = "Proceed";
  modalButton.onclick = () => {
    modal.close();
    yesCallback();
  };
  yesnoc.appendChild(modalButton);

  modalContent.appendChild(yesnoc);
  document.body.appendChild(modal.modal);
  universal.uiSounds.playSound("int_confirm");
  return modal;
}

window.UniversalUI = {
  show: {
    showEditModal,
    showPick,
    showText,
  },
};

window.onclick = (e) => {
  if (e.srcElement.className !== "contextMenu") {
    if (document.querySelector(".contextMenu"))
      document.querySelector(".contextMenu").remove();
  }
  universal.uiSounds.playSound("click");
};

document.addEventListener("keydown", (ev) => {
  if (editorButton.dataset.state != "not") return;
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

// document.querySelector("#es-profiles").appendChild(profileSelect);

// get url params
const editing = universal.load("now-editing");

if (editing) {
  setTimeout(() => {
    const interaction = universal.app_sounds.filter((sound) => {
      const k = Object.keys(sound)[0];
      return sound[k].uuid === editing;
    })[0];
    if (interaction) {
      editTile({
        srcElement: {
          getAttribute: (attr) => {
            return JSON.stringify(interaction[Object.keys(interaction)[0]]);
          },
          dataset: {
            name: Object.keys(interaction)[0],
            interaction: JSON.stringify(
              interaction[Object.keys(interaction)[0]]
            ),
          },
          className: "button k-0",
        },
      });
    }
    universal.remove("now-editing");
  }, 250);
}

if (universal.load("has_setup") === "false") {
  universal.ctx.destructiveView("setup");
  const view_container = document.querySelector(universal.ctx.view_container);
  view_container.style.display = "block";
  leftSidebar.style.display = "none";
}

universal.on(universal.events.user_mobile_conn, (isConn) => {
  if (universal.load("has_setup") === "false") return;
  universal.waitForElement(".mobd", (ele) => {
    ele.style.display = isConn ? "none" : "flex";
  })
  universal.uiSounds.playSound(`mobile_${isConn ? "" : "dis"}connect`);
});

if (universal._information.mobileConnected) {
  universal.waitForElement(".mobd", (ele) => {
    ele.style.display = "none";
  })
}

const setToLocalCfg = (key, value) => {
  const cfg = universal.lclCfg();
  cfg[key] = value;
  return cfg;
};

const lcfg = universal.lclCfg();
document.documentElement.style.setProperty("--tile-columns", `repeat(${lcfg.tileCols ? lcfg.tileCols : "5"}, 2fr)`);

universal.listenFor("audio-end", (data) => {
  const filname = data.name.replace(/[^a-zA-Z0-9]/g, "");
  if (document.querySelector(`.s-${filname}`))
    document.querySelector(`.s-${filname}`).remove();
});

window.showPick = showPick;
window.showText = showText;
window.showYesNo = showYesNo;
window.showEditModal = showEditModal;

makeThanks(false);
