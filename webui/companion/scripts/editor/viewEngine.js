import { translatePage } from "../../../shared/localization";

const editorButton = document.querySelector("#editor-btn");

const openViewTop = (view) => {
	translatePage();
	document.querySelector(`#${view}-only`).style.display='flex'
	editorButton.dataset.state = `o ${view}`;
};

const closeAllViews = () => {
	editorButton.dataset.state = "c";
};

export { openViewTop, closeAllViews };
