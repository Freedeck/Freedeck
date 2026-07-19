import { translatePage } from "../../../shared/localization";

const editorButton = document.querySelector("#editor-btn");

const openViewTop = (view) => {
	translatePage();
	editorButton.dataset.state = `o ${view}`;
};

const closeAllViews = () => {
	editorButton.dataset.state = "c";
};

export { openViewTop, closeAllViews };
