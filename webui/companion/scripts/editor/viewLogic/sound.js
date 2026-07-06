import { loadData } from "../data.js";
import EditorViewLogic from "./EditorViewLogic.js";

const type = document.querySelector("#type");
const editorButton = document.querySelector("#editor-btn");

const mainContainer = document.createElement("div");
mainContainer.classList.add("flex-wrap-r", "alc", "fill");

const sectionsContainer = document.createElement("div");
sectionsContainer.classList.add("flex-wrap", "aud-container", "aud-info");

const editorAudiofileView = document.createElement("div");
editorAudiofileView.classList.add("section-audiofile");

const titleDescContainer = document.createElement("span");
titleDescContainer.classList.add("flex-wrap", "no-gap");

const editorAudiofileTitle = document.createElement('h3');
const editorAudiofileDesc = document.createElement('p');
titleDescContainer.append(editorAudiofileTitle, editorAudiofileDesc);

const audioFile = document.createElement("small");
audioFile.id = 'audio-file';
audioFile.classList.add('information-border', 'flex-wrap-r', 'alc', 'aud-item');

const quickUpload = document.createElement("button");
quickUpload.classList.add("button", "companion-wide-button");

const upload = document.createElement("button");
upload.classList.add("button", "companion-wide-button");

editorAudiofileView.append(titleDescContainer, audioFile, quickUpload, upload);

const editorControlView = document.createElement("div");
editorControlView.classList.add("section-control");

const controlTitleDescContainer = document.createElement("span");
controlTitleDescContainer.classList.add("flex-wrap", "no-gap");

const editorControlTitle = document.createElement('h3');
const editorControlDesc = document.createElement('p');
controlTitleDescContainer.append(editorControlTitle, editorControlDesc);

const true_selector_control = document.createElement("select");
editorControlView.append(controlTitleDescContainer, true_selector_control);

sectionsContainer.append(editorAudiofileView, editorControlView);

const pickBtnContainer = document.createElement("div");
pickBtnContainer.classList.add("flex-wrap", "aud-container", "aud-info");

function make(id, src, alt) {
  const image = document.createElement("img");
  image.id = id;
  image.src = src;
  image.alt = alt;
  image.width = '50';
  image.loading = 'lazy';
  return image;
}

const pickForAudioFile = make("section-t_audio", "/app/shared/icons/t_audio.svg", "Audio File");
const pickForControl = make("section-t_ctrl", "/app/shared/icons/audio.svg", "Audio Control");
pickBtnContainer.append(pickForAudioFile, pickForControl);

mainContainer.append(sectionsContainer, pickBtnContainer);

// Inter-view toggle behavior
pickForAudioFile.onclick = () => {
  editorAudiofileView.style.display = "flex";
  editorControlView.style.display = "none";
  const intr = JSON.parse(editorButton.getAttribute("data-interaction"));
  intr.type = "fd.sound";
  editorButton.setAttribute("data-interaction", JSON.stringify(intr));
};

pickForControl.onclick = () => {
  editorAudiofileView.style.display = "none";
  editorControlView.style.display = "flex";
  true_selector_control.selectedIndex = 0;
  true_selector_control.dispatchEvent(new Event("change"));
};

const featureFlags = [true, false, false, false];
const availableTypes = [
  ["fd.stopall", {}, "button"],
  ["fd.sb.pitch", { min: 0, max: 100, value: 0, direction: "vertical" }, "slider"],
  ["fd.sb.vol.out", { min: 0, max: 100, value: 0, direction: "vertical" }, "slider"],
  ["fd.sb.vol.mon", { min: 0, max: 100, value: 0, direction: "vertical" }, "slider"],
];

true_selector_control.onchange = (e) => {
  const i = true_selector_control.selectedIndex;
  if (!featureFlags[i]) {
    universal.sendToast(
      "This feature is not fully supported yet and may be broken, sorry! It will become available in a future release.",
      "Freedeck",
    );
    true_selector_control.selectedIndex = 0;
    return;
  }
  const typeDef = availableTypes[i];
  const intr = JSON.parse(editorButton.getAttribute("data-interaction"));
  intr.type = typeDef[0];
  intr.data = { ...intr.data, ...typeDef[1] };
  intr.renderType = typeDef[2];
  editorButton.setAttribute("data-interaction", JSON.stringify(intr));
};

class Sound extends EditorViewLogic {
  constructor() {
    super(
      "audio",
      "fd.sound",
      "fd.stopall",
      "fd.sb.pitch",
      "fd.sb.vol.out",
      "fd.sb.vol.mon",
    );

    this.setSectionTitleKey("editor.sections.no_action.soundboard");
    this.setSectionDescriptionKey("editor.sections.soundboard.description");
    
    this.setElementsToAdd(() => {
      return [mainContainer];
    });

    this.setOnRun(({ interactionData }) => {
      // Dynamic translation refresh when running the component view layout safely
      editorAudiofileTitle.textContent = universal.translationKey('editor.sections.soundboard.audiofile');
      editorAudiofileDesc.textContent = universal.translationKey('editor.sections.soundboard.action');
      quickUpload.textContent = universal.translationKey("editor.sections.soundboard.quickupload");
      upload.textContent = universal.translationKey("editor.sections.soundboard.change");
      
      editorControlTitle.textContent = universal.translationKey('editor.sections.soundboard.control');
      editorControlDesc.textContent = universal.translationKey('editor.sections.soundboard.control_action');

      // Refresh dynamic dropdown options sequentially
      true_selector_control.innerHTML = "";
      true_selector_control.append(
        this.makeOption("editor.sections.soundboard.control.selector.stopall"),
        this.makeOption("editor.sections.soundboard.control.selector.pitch"),
        this.makeOption("editor.sections.soundboard.control.selector.output_volume"),
        this.makeOption("editor.sections.soundboard.control.selector.monitor_volume")
      );

      if (interactionData.data && interactionData.data.file) {
        audioFile.innerText = interactionData.data.file;
      }

      if (interactionData.type === "fd.sound") {
        editorAudiofileView.style.display = "flex";
        editorControlView.style.display = "none";
      } else {
        editorAudiofileView.style.display = "none";
        editorControlView.style.display = "flex";
        let i = 0;
        for (const [typeOption] of availableTypes) {
          if (typeOption === interactionData.type) {
            true_selector_control.selectedIndex = i;
          }
          i++;
        }
      }
    });

    this.setOnFirstSetup(({ interactionData }) => {
      editorAudiofileView.style.display = "flex";
      editorControlView.style.display = "none";
      interactionData.type = "fd.sound";
      interactionData.data.file = "Unset, please change!";
      interactionData.data.path = "/sounds/";
      editorButton.setAttribute(
        "data-interaction",
        JSON.stringify(interactionData),
      );
      audioFile.innerText = "Unset, please change!";
      if (type) type.value = "fd.sound";
    });

    // Encapsulate upload click hooks inside the module lifecycle scope safely
    this.setupAssetActions();
  }

  makeOption(k) {
    const o = document.createElement("option");
    o.innerText = universal.translationKey(k);
    return o;
  }

  setupAssetActions() {
    upload.onclick = () => {
      const sidebarEl = document.querySelector("#sidebar");
      if (sidebarEl) sidebarEl.style.right = "-20%";
      universal.uiSounds.playSound("int_confirm");
      const ito = JSON.parse(editorButton.dataset.interaction);
      
      universal.listenForOnce("library_load", () => {
        universal.sendEvent("library_request", "sound");
      });
      
      universal.listenForOnce("library_paint", () => {
        const preselectedElement = document.querySelector(`.upload[data-name='${ito.data.file}']`);
        if (ito.data.file && preselectedElement) preselectedElement.classList.add("glow");
        
        for (const uploadedIcon of document.querySelectorAll(".uploads-0 .upload")) {
          uploadedIcon.onclick = () => {
            for (const glowingIcon of document.querySelectorAll(".glow")) {
              glowingIcon.classList.remove("glow");
            }
            uploadedIcon.classList.add("glow");

            ito.data.file = uploadedIcon.dataset.name;
            ito.data.path = "/sounds/";
            editorButton.setAttribute("data-interaction", JSON.stringify(ito));
            loadData(ito.data);
            
            const fileDataEl = document.querySelector("#file.editor-data");
            const pathDataEl = document.querySelector("#path.editor-data");
            if (fileDataEl) fileDataEl.value = uploadedIcon.dataset.name;
            if (pathDataEl) pathDataEl.value = "/sounds/";
            
            audioFile.innerText = uploadedIcon.dataset.name;
            universal.uiSounds.playSound("int_yes");
          };
        }
      });
      
      universal.listenForOnce("library_save", () => {
        const sidebarEl = document.querySelector("#sidebar");
        if (sidebarEl) sidebarEl.style.right = "0";
      });
      universal.vopen("library");
    };

    quickUpload.onclick = () => {
      universal.uiSounds.playSound("int_confirm");
      universal.listenForOnce("library_load", () => {
        if (typeof universal._Uploads_New === "function") {
          universal._Uploads_New(1, true);
        }
        universal.sendEvent("library_request", "sound")
      });
      universal.vopen("library");
    };
  }
}

export default Sound;