import { translatePage } from "../../../shared/localization";

const editorButton = document.querySelector("#editor-btn");

const openViewTop = (view) => {
	translatePage();
	if(view == 'none') document.querySelector("#none-only").style.display='block'
	editorButton.dataset.state = `o ${view}`;
};

const closeAllViews = () => {
	editorButton.dataset.state = "c";
};

export { openViewTop, closeAllViews };
