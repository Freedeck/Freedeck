const settingsMenuContainer = document.querySelector(".settings-menu");
const tilesContainer = document.querySelector("#keys");
/**
 * Open the settings menu (on clients only)
 */
function settingsMenu() {
	if (universal.name === "Main") {
		tilesContainer.style.transitionDuration = "0.5s";
		tilesContainer.style.pointerEvents = "none";
		settingsMenuContainer.style.display = "flex";
		tilesContainer.style.opacity = "0";
	}
}
function settingsMenuClose() {
	if (universal.name === "Main") {
		// document.querySelector("#keys").style.display = "grid";
		// settingsMenuContainer.style.display = "none";
		settingsMenuContainer.style.animationName = "pull-up";
		tilesContainer.style.opacity = "1";
		tilesContainer.style.pointerEvents = "unset";

		setTimeout(() => {
			settingsMenuContainer.style.display = "none";
			settingsMenuContainer.style.animationName = "pull-down";
		}, 499);
	}
}
const ts = document.querySelector("#theme-set");
if(ts) {
	const remButton = document.createElement("button");
	remButton.textContent = "<";
	remButton.classList.add("rembutton")
	document.querySelector("body").appendChild(remButton);

	remButton.onclick =() => {
		remButton.style.display = 'none';

		tilesContainer.style.transitionDuration = "0.5s";
		universal.keys.parentElement.style.transform = "translate(-50%, -50%)"
		setTimeout(()=>{
			document.querySelector(".themelist.client").style.right='-100%'
			document.querySelector(".themelist.client").style.opacity='1'
		},20)
	}

	ts.onclick = () => {
		remButton.style.display = 'flex';
		settingsMenuContainer.style.animationName = "pull-up";
		tilesContainer.style.opacity = "1";
		tilesContainer.style.pointerEvents = "unset";
		document.querySelector(".themelist.client").style.display='flex'
		universal.keys.classList.remove("smaller");
		universal.keys.parentElement.style.transform = "translate(calc(-70% - 1rem), -50%)"
		setTimeout(()=>{
			document.querySelector(".themelist.client").style.right='0'
			document.querySelector(".themelist.client").style.opacity='1'
		},20)
		setTimeout(() => {
			settingsMenuContainer.style.display = "none";
			settingsMenuContainer.style.animationName = "pull-down";
		}, 499);
	}
}

const settingsClose = document.querySelector("#settings-close");
const versionDisplay = document.querySelector("#version");
function makeSettingsMenu() {
	if (versionDisplay) {
		versionDisplay.innerText = `${universal._information.version.human}`;
	}

	settingsClose.addEventListener("click", settingsMenuClose);
}

export { makeSettingsMenu, settingsMenu, settingsMenuClose };
