import EditorViewLogic from "./EditorViewLogic.js";

const type = document.querySelector("#type");
const editorButton = document.querySelector("#editor-btn");

class Macro extends EditorViewLogic {
  constructor() {
    super("macro", "fd.macro", "fd.macro_text");
  
    this.setOnRun(({interactionData}) => {
      const data = interactionData.data;
      if(data.macro) {
        document.querySelector("#macro-type").value = interactionData.type === "fd.macro" ? "macro" : "text";
        document.querySelector("#macro-macro").value = data.macro;
      }
    })

    this.setOnFirstSetup(() => {
      const int = JSON.parse(editorButton.getAttribute("data-interaction"));
      int.type = "fd.macro_text";
      type.value = "fd.macro_text";
      editorButton.setAttribute("data-interaction", JSON.stringify(int));
    })
  }
}

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

export default Macro;