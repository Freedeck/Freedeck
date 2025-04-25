const Pages = {};

import { translationKey } from "../../shared/localization.js";
import createTileRenderer from "./ui/createTileRenderer.js";
import gridItemDrag from "../../companion/scripts/lib/gridItemDrag.js";

function makeGenericModal(
  title,
  content,
  buttons,
  closable,
  rawHtml = "",
  hidesInsteadOfClose = false
) {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.innerHTML = `<div class="modalContent"><div class="modal-header"><h2 class="modal-title" style="text-align:left;">${title}</h2><span class="close modal-close">&times;</span></div><div class="modal-body"><p class="modal-description" style="text-align:left;width:100%;">${content}</p>${rawHtml}</div><div class="modal-footer"></div></div>`;
  const footer = modal.querySelector(".modal-footer");
  if (!closable) modal.querySelector(".modal-close").style.display = "none";
  for (const button of buttons) {
    const btn = document.createElement("button");
    btn.innerText = button.text;
    btn.onclick = button.onclick;
    footer.appendChild(btn);
  }
  document.body.appendChild(modal);
  modal.querySelector(".close").onclick = () => {
    if (hidesInsteadOfClose) {
      modal.classList.add("closing");
      modal.querySelector(".modal-body").classList.add("closing");
      setTimeout(() => {
        modal.style.display = "none";
      }, 250);
      return;
    }
    modal.classList.add("closing");
    modal.querySelector(".modal-body").classList.add("closing");
    setTimeout(() => {
      modal.remove();
    }, 250);
  };
  return {
    modal,
    content: modal.querySelector(".modal-body"),
    close: (playSound=true) => {
      modal.classList.add("closing");
      modal.querySelector(".modal-body").classList.add("closing");
      if(playSound)universal.uiSounds.playSound("int_no");
      setTimeout(() => {
        modal.remove();
      }, 250);
    },
    hide: () => {
      modal.classList.add("closing");
      modal.querySelector(".modal-body").classList.add("closing");
      setTimeout(() => {
        modal.style.display = "none";
      }, 250);
    },
    forceHide: () => {
      modal.style.display = "none";
    },
    show: () => {
      modal.classList.remove("closing");
      modal.querySelector(".modal-body").classList.remove("closing");
      modal.style.display = "flex";
    },
  };
}

/**
 * @name quickActions
 * @param {*} e The event that was triggered
 */
function quickActions(e) {}

let openCloseBootLog;
let bootLog;
let bootLogCenter;
let bootLogContainer;

function makeBootLog() {
  const thisbootLog = document.createElement("div");
  thisbootLog.id = "boot-log-div";
  thisbootLog.innerHTML =
    "<img src='/assets/logo_big.png' class='n-icon'><h1>Freedeck</h1><div style='display:none;' id='boot-log'><center class='oclb'><button id='oclb'>Close Boot Log</button><button onclick='universal.storage.reset()'>Reset Storage</button></center></div>";
  document.body.appendChild(thisbootLog);
  bootLog = thisbootLog;
  bootLogCenter = document.querySelector("#boot-log-div > center");
  bootLogContainer = document.querySelector("#boot-log");
  bootLogContainer.style.display = "none";
  thisbootLog.addEventListener("click", () => {
    bootLogContainer.style.display = "block";
  });
  thisbootLog.addEventListener("touchstart", () => {
    bootLogContainer.style.display = "block";
  });
  openCloseBootLog = document.querySelector("#oclb");
  openCloseBootLog.style.display = "none";
  openCloseBootLog.addEventListener("click", () => {
    closeBootLog();
  });
}

function showBootLog(showText=true) {
  return new Promise((resolve, reject) => {
    if(showText) {
      universal.CLU(
        "Boot / UI : WARNING!",
        "The boot log style hasn't been updated, and won't be! You may notice a few imperfections."
      );
      bootLogContainer.style.scale = "1";
      bootLogContainer.style.display = "block";
      openCloseBootLog.style.display = "block";
    }
    bootLog.querySelector("h1").style.animation = "real-fade-in 0.5s";
    bootLog.querySelector("img").style.animation = "real-fade-in 0.5s";
    bootLog.style.animation = "pull-down-boot-log 0.5s";
    bootLog.style.display = "block";
  });
}

function closeBootLog() {
  return new Promise((resolve, reject) => {
    resolve(true);
    bootLogContainer.style.scale = "0";
    openCloseBootLog.style.display = "none";
    if (universal.lclCfg()["app.freedeck.skip_boot_animation"]) {
      bootLog.style.display = "none";
      if (window.splashScreen) window.splashScreen.unsplash();
    } else {
      setTimeout(() => {
        bootLogContainer.style.display = "none";
        if (window.splashScreen) window.splashScreen.unsplash();
        setTimeout(() => {
          bootLog.style.animation = "pull-up 0.5s";
          bootLog.querySelector("h1").style.animation = "real-fade-out 0.5s";
          bootLog.querySelector("img").style.animation = "real-fade-out 0.5s";
          setTimeout(() => {
            bootLog.style.display = "none";
          }, 499);
        }, 200);
      }, 499);
    }
  });
}

function initialize() {
  universal.CLU("Boot / UI", "Initializing UI");
  universal.config.iconCountPerPage =
    Number.parseInt(universal.lclCfg().iconCountPerPage) || 12;
  universal.CLU("Boot / UI", "Set icon count");
  universal.theming.setTheme(
    universal.config.theme ? universal.config.theme : "default.css",
    false
  );
  universal.CLU("Boot / UI", "Set local theme");
  if (universal.lclCfg()["font-size"] !== 15) {
    document.documentElement.style.setProperty(
      "--font-size",
      `${universal.lclCfg()["font-size"]}px`
    );
  }
  universal.CLU("Boot / UI", "Set font size");
  reloadSounds();
  universal.CLU("Boot / UI", "Reloaded sounds");
  universal.CLU("Boot / UI", "UI initialized");
  universal.showBootLog = showBootLog;
  universal.closeBootLog = closeBootLog;
}

/**
 * @name reloadProfile
 * @description Reload the current profile
 */
function reloadProfile() {
  universal.app_sounds = [];
  try {
    universal.app_sounds = universal.config.profiles[universal.config.profile];
  } catch (e) {
    console.log(e);
  }
  let max = 0;
  for (
    let i = 0;
    i < universal.app_sounds.length / universal.config.iconCountPerPage;
    i++
  ) {
    Pages[i] = true;
    max++;
  }

  for (const sound of universal.app_sounds) {
    const k = Object.keys(sound)[0];
    const snd = sound[k];
    if (snd.pos >= max * universal.config.iconCountPerPage) {
      Pages[max] = true;
      max++;
    }
  }
}

/**
 * @name reloadPluginViews
 * @description reload plugin views for the editor
 */
function reloadPluginViews() {
  for (const view of document.querySelectorAll(".plugin-view")) {
    view.remove();
  }
  for (const plkey in universal.plugins) {
    const plugin = universal.plugins[plkey];
    if (Object.keys(plugin.views).length === 0) continue;
    for (const view in plugin.views) {
      const viewData = plugin.views[view];
      const viewElement = document.createElement("div");
      viewElement.classList.add("plugin-view");
      viewElement.classList.add("editor-section");
      viewElement.style.display = "none";
      viewElement.id = `plugin-view-${btoa(view).toLowerCase().split("=")[0]}`;
      (async () => {
        const data = await fetch(
          `/user-data/plugin-views/${plugin.id}/${viewData}/view.html`
        );
        const text = await data.text();
        viewElement.innerHTML = text;
        const script = document.createElement("script");
        script.src = `/user-data/plugin-views/${plugin.id}/${viewData}/script.js`;
        script.type = "module";
        document.body.appendChild(script);
      })();
      document
        .querySelector("#editor-div")
        .insertBefore(viewElement, document.querySelector(".editor-options"));
      const selectorBtn = document.createElement("button");
      selectorBtn.innerText = view;
      selectorBtn.onclick = () => {
        document.querySelector("#none-only").style.display = "none";
        for (const v of document.querySelectorAll(".plugin-view")) {
          v.style.display = "none";
        }
        const editor = document.querySelector("#editor-btn");
        const int = JSON.parse(editor.getAttribute("data-interaction"));
        int.data._view = btoa(view).toLowerCase().split("=")[0];
        universal.setTileData(
          "_view",
          btoa(view).toLowerCase().split("=")[0],
          int
        );
        editor.setAttribute("data-interaction", JSON.stringify(int));
        document.querySelector(
          `#plugin-view-${btoa(view).toLowerCase().split("=")[0]}`
        ).style.display = "block";
      };
      document.querySelector(".plugin-view-listing").appendChild(selectorBtn);
    }
  }
}
window.RplTest = reloadPluginViews;

function reloadSounds() {
  // Cache DOM elements and values to avoid repeated lookups
  const keysContainer = universal.keys;
  const currentPage = (universal.page = universal.load("page")
    ? Number.parseInt(universal.load("page"))
    : 0);
  const iconsPerPage = (universal.config.iconCountPerPage =
    universal.lclCfg().iconCountPerPage);
  const startIndex = iconsPerPage * currentPage;
  const endIndex = iconsPerPage * (currentPage + 1);
  const isCompanionMode = universal.name === "Companion";

  // Handle fill style - batch style operations
  if (universal.lclCfg()['app.freedeck.ui.fill_tiles']) {
    let fillStyle = document.getElementById("fill");
    if (!fillStyle) {
      fillStyle = document.createElement("style");
      fillStyle.type = "text/css";
      fillStyle.id = "fill";
      fillStyle.appendChild(
        document.createTextNode(
          `#keys .button { width: unset; height: unset; }`
        )
      );
      document.head.appendChild(fillStyle);
    }
  } else {
    const fillStyle = document.getElementById("fill");
    if (fillStyle) fillStyle.remove();
  }

  // Handle compact mode in one operation
  keysContainer.style.width = universal.lclCfg().compact ? "unset" : "100%";
  keysContainer.style.height = universal.lclCfg().compact ? "unset" : "100%";
  if(universal.name !== "Companion") {
    keysContainer.style.padding = universal.lclCfg().compact ? ".25rem" : "1rem";
  }

  // Don't remove the keys, we'll update them in place
  // Just remove tooltips and buttons
  document.querySelectorAll("#keys > .button").forEach((key) => key.remove());
  document.querySelectorAll(".tile-tooltip").forEach((el) => el.remove());

  // Update page indicator in one operation
  const pageIndicator = document.querySelector(".cpage");
  if (pageIndicator) {
    pageIndicator.innerText = `${translationKey("sidebars.left.pages.page")}${
      currentPage + 1
    }/${Object.keys(Pages).length}`;
  }

  reloadProfile();
  universal.keySet(); // This probably creates the .k-N elements, so we don't want to remove them

  // Create tooltip fragment for batch insertion
  const tooltipFragment = document.createDocumentFragment();

  // Pre-filter sounds for current page
  const currentPageSounds = universal.app_sounds.filter((sound) => {
    const soundKey = Object.keys(sound)[0];
    const pos = sound[soundKey].pos;
    return pos >= startIndex && pos < endIndex;
  });

  // Find duplicates once rather than in each iteration
  const positionCounts = {};
  currentPageSounds.forEach((sound) => {
    const soundKey = Object.keys(sound)[0];
    const pos = sound[soundKey].pos;
    positionCounts[pos] = (positionCounts[pos] || 0) + 1;
  });

  // Process only sounds for the current page - without changing element order
  for (const sound of currentPageSounds) {
    try {
      const k = Object.keys(sound)[0];
      const snd = sound[k];

      if (snd.plugin) snd.plugin = snd.plugin.toLowerCase();

      // Calculate the actual position in the grid for this page
      const pageOffset = universal.config.iconCountPerPage * universal.page;
      const posInPage = snd.pos - pageOffset;

      // Use the existing key element at this position
      let keyObject = document.querySelector(`.k-${posInPage}`);

      if (!keyObject) continue;

      // Remove slider container if exists
      const sliderContainer = keyObject.querySelector(".slider-container");
      if (sliderContainer) sliderContainer.remove();

      // Set attributes in batch
      keyObject.setAttribute("data-interaction", JSON.stringify(snd));
      keyObject.setAttribute("data-name", k);
      keyObject.classList.remove("unset");

      // Batch style changes
      const styleChanges = {};
      if (snd.data.icon)
        styleChanges.backgroundImage = `url("${snd.data.icon}")`;
      if (snd.data.color) styleChanges.backgroundColor = snd.data.color;
      if (snd.data.fontSize) styleChanges.fontSize = snd.data.fontSize;

      // Apply all style changes at once
      Object.assign(keyObject.style, styleChanges);

      // Handle other types
      createTileRenderer(snd.type, keyObject, snd, sound);

      // Check for missing plugins or types
      if (!snd.type.includes("fd.")) {
        if (!universal.plugins[snd.plugin]) {
          const indicator = document.createElement("div");
          indicator.classList.add("indicator-red");
          keyObject.appendChild(indicator);
        } else {
          let typeExists = false;
          for (const tyc of universal._tyc.keys()) {
            if (tyc.type === snd.type) {
              typeExists = true;
              break; // Early exit when found
            }
          }
          if (!typeExists) {
            const indicator = document.createElement("div");
            indicator.classList.add("indicator-yellow");
            keyObject.appendChild(indicator);
          }
        }
      }

      // Mark duplicates
      if (positionCounts[snd.pos] > 1) {
        keyObject.classList.add("duplicate");
      }

      // Skip tooltip creation if not in Companion mode
      if (!isCompanionMode) continue;

      // Build tooltip content efficiently with template literals
      let tooltipContent = `<h4>${universal.cleanHTML(k, false)}</h4>`;

      tooltipContent +=
        snd.renderType !== "text"
          ? `<p>${
              snd.data.longPress === "true" ? "Long press" : "Short press"
            } to activate.</p>`
          : "<p>Not pressable.</p>";

      if (snd.plugin) {
        tooltipContent += universal.plugins[snd.plugin]
          ? `<p>This tile uses ${universal.cleanHTML(
              universal.plugins[snd.plugin].name,
              false
            )}.</p>`
          : `<p>${universal.cleanHTML(
              snd.plugin,
              false
            )} could not be found.</p>`;

        // Find matching type only once
        let typeName = null;
        for (const i of Array.from(universal._tyc.keys())) {
          if (i.type === snd.type) {
            typeName = i.name;
            break;
          }
        }
        if (typeName) tooltipContent += `<code>${typeName}</code>`;
      }

      // Add type-specific content with switch for better performance
      switch (snd.type) {
        case "fd.sound":
          tooltipContent += `<p>Plays sound:</p><code>${universal.cleanHTML(
            snd.data.path,
            false
          )}${universal.cleanHTML(snd.data.file, false)}</code>`;
          break;
        case "fd.profile":
          tooltipContent += `<p>Opens folder:</p><code>${universal.cleanHTML(
            snd.data.profile,
            false
          )}</code>`;
          break;
        case "fd.macro_text":
          tooltipContent += `<p>Types out:</p><code>${universal.cleanHTML(
            snd.data.macro,
            false
          )}</code>`;
          break;
        case "fd.macro":
          tooltipContent += `<p>Presses:</p><code>${universal.cleanHTML(
            snd.data.macro,
            false
          )}</code>`;
          break;
        case "fd.none":
          tooltipContent += "<p>Does nothing.</p>";
          break;
      }

      tooltipContent += `<p>Right click to edit.</p><i>${snd.type}</i>`;

      const tt = universal.createTooltipFor(keyObject, tooltipContent);
      tt.classList.add("tile-tooltip");
      tooltipFragment.appendChild(tt);
    } catch (e) {
      const k = Object.keys(sound)[0];
      console.log(
        `while rendering sound: ${k}`,
        sound[k],
        "on page",
        universal.page
      );
      console.error(e);
    }
  }

  // Append all tooltips to the DOM at once
  document.body.appendChild(tooltipFragment);
  
  if(universal.name === "Companion") {
    gridItemDrag.setContext(universal.keys);
  }

  universal.sendEvent("page_change");

  // Handle empty tiles in Companion mode
  if (isCompanionMode) {
    const unsetElements = document.querySelectorAll(".unset");
    const unsetTooltipFragment = document.createDocumentFragment();

    for (const e of unsetElements) {
      const tooltipContent =
        "<h4>Nothing!</h4><p>Click this space to create a new Tile here.</p>";
      const tt = universal.createTooltipFor(e, tooltipContent);
      tt.classList.add("tile-tooltip");
      unsetTooltipFragment.appendChild(tt);

      const pos =
        Number.parseInt(e.className.split(" ")[1].split("-")[1]) +
        (universal.page < 0 ? 1 : 0) +
        (universal.page > 0
          ? universal.config.iconCountPerPage * universal.page
          : 0);

      const uuid = `fdc.${Math.random() * 10000000}`;
      UI.reloadProfile(); // Keep original call to UI.reloadProfile()

      const interaction = {
        type: "fd.none",
        pos,
        uuid,
        data: {},
      };

      // Store interaction data on element directly to avoid recreating it in click handler
      e._interactionData = {
        interaction,
        name: "Enter Title",
      };

      e.addEventListener("click", clickHandleNewTile);
    }

    // Append all unset tooltips to the DOM at once
    document.body.appendChild(unsetTooltipFragment);
  }
}

// Separate handler function to reduce function creation in loops
function clickHandleNewTile(v) {
  const interaction = this._interactionData.interaction;
  const tileName = this._interactionData.name;

  universal.send(universal.events.companion.new_tile, {
    [tileName]: interaction,
  });

  universal.listenForOnce("page_change", () => {
    universal.editTile({
      srcElement: {
        getAttribute: () => JSON.stringify(interaction),
        dataset: {
          name: tileName,
          interaction: JSON.stringify(interaction),
        },
        className: "button k-0 k",
      },
    });
  });
}

function _visualChange(tileId, text, matcher) {
	for (const button of document.querySelectorAll(".button[data-interaction]")) {
		if (button.id === "editor-btn") continue;
		try {
      const dat = JSON.parse(button.getAttribute("data-interaction"));
      if (matcher({data:dat, button})) {
        const txt = button.querySelector(".button-text p");
        if (txt) {
          txt.innerText = text;
        }
      }
    } catch (error) {}
  }
}

function visualIdTileChangeText(tileId, text) {
	return _visualChange(tileId, text, ({data}) => data.uuid === tileId)
}

function visualTypeTileChangeText(tileId, text) {
	return _visualChange(tileId, text, ({data}) => data.type === tileId)
}

export const UI = {
  reloadSounds,
  reloadProfile,
  quickActions,
  Pages,
  initialize,
  makeBootLog,
  closeBootLog,
  showBootLog,
  visual: {
    idChangeText: visualIdTileChangeText,
    typeChangeText: visualTypeTileChangeText,
  },
  makeGenericModal,
  reloadPluginViews,
};
