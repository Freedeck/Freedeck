import {translatePage} from "../../../shared/localization";

const editorButton = document.querySelector("#editor-btn");
const selectableViews = [
  "audio",
  "plugins",
  "system",
  "none",
  "profiles",
  "macro",
];

const openViewTop = (view) => {
  for (const v of selectableViews) {
    document.querySelector(`#${v}-only`).style.display = "none";
  }
  translatePage();
  document.querySelector(`#${view}-only`).style.display = "flex";
  editorButton.dataset.state = `o ${view}`;
};

const closeAllViews = () => {
  for (const v of selectableViews) {
    document.querySelector(`#${v}-only`).style.display = "none";
  }
  editorButton.dataset.state = "c";
};

export {
  openViewTop,
  closeAllViews,
};