import { UI } from "../../client/scripts/ui.js";
import { universal } from "../../shared/universal.js";
import {openViewTop, closeAllViews} from "./editor/viewEngine.js";
import {loadData, setTileData} from "./editor/data.js";
import "./sidebar.js";
import "./uploadsHandler.js";
import "./editor/loader.js";
import "./contextMenu.js";
import { makeThanks } from "./changelog/create.js";
import Sound from "./editor/viewLogic/sound.js";
import Plugins from "./editor/viewLogic/plugins.js";
import System from "./editor/viewLogic/system.js";
import EditorViewLogic from "./editor/viewLogic/EditorViewLogic.js";
import Macro from "./editor/viewLogic/macro.js";
import Profile from "./editor/viewLogic/profile.js";
import "./dragHandler.js";
import { translationKey } from "../../shared/localization.js";
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

class EditorView {
  /**@type {any} Any universal unique ID. */
  id;
  /**@type {EditorViewLogic} The EditorViewLogic used for this view */
  logic;
  /**@type {string} A translation key to use for the no-action screen. */
  noActionTranslationKey;
  /**@type {string} Path to the icon */
  icon;
  /**
   * Create an EditorView
   * @param {any} id Any universal unique ID.
   * @param {EditorViewLogic} logic The EditorViewLogic used for this view
   * @param {string} noActionTranslationKey A translation key to use for the no-action screen.
   * @param {string} icon Path to the icon
   */
  constructor(id, logic, noActionTranslationKey, icon) {
    this.id = id;
    this.logic = logic;
    this.noActionTranslationKey = noActionTranslationKey;
    this.icon = icon;
  }
}

const editorBuiltInViews = [
  new EditorView("audio", new Sound(), "editor.sections.no_action.soundboard", "/common/icons/t_audio.svg"),
  new EditorView("plugins", new Plugins(), "editor.sections.no_action.plugin", "/common/icons/t_plugin.svg"),
  new EditorView("macro", new Macro(), "editor.sections.no_action.macro", "/common/icons/t_plugin.svg"),
  new EditorView("system", new System(), "editor.sections.no_action.app_volume", "/common/icons/t_app_volume.svg"),
  new EditorView("profiles", new Profile(), "editor.sections.no_action.folder_changer", "/common/icons/t_folder.svg")
]

const pluginListing = document.querySelector(".plugin-view-listing");
for(const view of editorBuiltInViews) {
  console.log(`Setting up ${view.id}`);
  const viewButton = document.createElement("button");
  const keyInfo = document.createElement("p");
  const keyIcon = document.createElement("img");
  keyInfo.setAttribute("data-i18n-key", view.noActionTranslationKey);
  keyInfo.innerText = translationKey(view.noActionTranslationKey);
  keyIcon.src = view.icon;
  keyIcon.loading = 'lazy';
  viewButton.onclick = (e) => {
    openViewTop(view.logic.view);
    view.logic.onFirstSetup({
      interactionData: JSON.parse(editorButton.getAttribute("data-interaction")),
    })
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
    e.srcElement.getAttribute("data-interaction")
  );
  editorButton.dataset.state = "init";
  universal.keys.classList.add("smaller")
  for(const el of document.querySelectorAll(".k")) {
    el.classList.add("smaller");
    el.classList.add("blur");
  }
  e.srcElement?.classList?.remove("smaller");

  const contextMenu = document.querySelector(".contextMenu");
  if(contextMenu) contextMenu.remove();

  for (const el of document.querySelectorAll(".plugin-view")) {
    el.style.display = "none";
  }
  
  editorContainer.style.display = "block";

  editorButton.setAttribute("data-pre-edit", e.srcElement.dataset.name);
  editorButton.setAttribute(
    "data-interaction",
    e.srcElement.getAttribute("data-interaction")
  );

  document.querySelector("#editor-back").style.display = "flex";
  
  closeAllViews();
  if (interactionData.data) {
    const itm = interactionData.data;
    loadData(itm);
  }

  if (!interactionData.type.startsWith("fd.")) {
    editorBuiltInViews[1].logic.forwardRunningEvent(interactionData.type, () => {
      openViewTop("plugins");
    }, {interactionData});
  }
  
  if (interactionData.type === "fd.none" && !interactionData.data._view) {
    openViewTop("none");
    document.querySelector("#editor-back").style.display = "none";
  } else {
    for(const v of editorBuiltInViews) {
      v.logic.forwardRunningEvent(interactionData.type, () => {
        openViewTop(v.logic.view);
      }, {interactionData});
    }
  } 
  
  document.querySelector("#plugin").style.display = interactionData.plugin!=="Freedeck"?"flex":"none";
  document.querySelector('label[for="plugin"]').style.display = interactionData.plugin!=="Freedeck"?"flex":"none";

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

  editorDiv.style.animationName ="editor-pull-down";
  universal.keys.parentElement.style.transform = "translate(-50%, -115%)" 
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


document.querySelector("#upload-sound").onclick = () => {
  document.querySelector("#upload-sound").disabled = true;
  document.querySelector("#sidebar").style.right = "-20%";
  universal.uiSounds.playSound("int_confirm");
  const ito = JSON.parse(editorButton.dataset.interaction);

  universal._libraryOnload = () => {
    setupLibraryFor("sound");
  };
  universal.listenForOnce("library_paint", () => {
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
      universal.vopen("index.html");
      document.querySelector("#sidebar").style.right = "0";
    };
  })
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
  universal.vopen("library");
};

document.querySelector("#quick-upload-sound").onclick = () => {
  document.querySelector("#upload-sound").disabled = true;
  universal.uiSounds.playSound("int_confirm");

  universal.vopen("library");
  universal._libraryOnload = () => {
    universal._Uploads_New(1, true);
    setupLibraryFor("sound");
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


universal.fdws.on("apps", (rawData) => {
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
  const ito = JSON.parse(editorButton.dataset.interaction);
  universal.listenForOnce("library_load", ()=>{setupLibraryFor("icon")});
  universal.listenForOnce("library_paint", () => {
    const preselectedElement = document.querySelector(`.upload[data-name='${ito.data.icon.split("/icons/")[1]}']`);
    if (ito.data.icon && preselectedElement) preselectedElement.classList.add("glow");
    for (const uploadedIcon of document.querySelectorAll(".uploads-1 .upload")) {
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
    const contextMenu = document.querySelector(".contextMenu");
    if (contextMenu) contextMenu.remove();
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

const lcfg = universal.getServerStyleFlags();
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
