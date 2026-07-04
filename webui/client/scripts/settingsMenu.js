const settingsMenuContainer = document.querySelector(".settings-menu");
const themeList = document.querySelector(".themelist")
const tilesContainer = document.querySelector("#keys");
/**
 * Open the settings menu (on clients only)
 */
function settingsMenu() {
	if (universal.name === "Main") {
		tilesContainer.style.transitionDuration = "0.5s";
		settingsMenuContainer.style.display = "flex";
		setTimeout(()=>{
			settingsMenuContainer.style.right='0'
			settingsMenuContainer.style.opacity='1'
		},20)
		universal.keys.parentElement.style.transform = "translate(calc(-70% - 1rem), -50%)"
	}
}
function settingsMenuClose() {
	if (universal.name === "Main") {
		// document.querySelector("#keys").style.display = "grid";
		// settingsMenuContainer.style.display = "none";
		settingsMenuContainer.style.animationName = "pull-up";
		universal.keys.parentElement.style.transform = "translate(-50%, -50%)"
		settingsMenuContainer.style.right='-100%';
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
		setTimeout(()=>{
			themeList.style.right='-100%'
			themeList.style.opacity='1'
		},20)
	}

	ts.onclick = () => {
		themeList.style.display='flex'
		remButton.style.opacity = 0;
		remButton.style.display='flex';
		setTimeout(()=>{
			themeList.style.right='0'
			themeList.style.opacity='1'
			setTimeout(() => {
				remButton.style.display = 'flex';
				remButton.style.opacity = 0.5;
			},499)
		},20)
	}
}

const settingsClose = document.querySelector("#settings-close");
const versionDisplay = document.querySelector("#version");
function makeSettingsMenu() {
	if (versionDisplay) {
		versionDisplay.innerText = `${universal._information.version.raw}`;
	}

	settingsClose.addEventListener("click", settingsMenuClose);
}

export { makeSettingsMenu, settingsMenu, settingsMenuClose };
