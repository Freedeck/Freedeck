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