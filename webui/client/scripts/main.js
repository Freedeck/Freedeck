import { universal } from "../../shared/universal.js";
import { makeSettingsMenu } from "./settingsMenu.js";

universal.listenForOnce("init", () => {
	makeSettingsMenu();
	checkPortrait();
	
const fc = document.querySelector("#folder-container")
	for(const i of Object.keys(universal._information.config.profiles)) {
			const btn = document.createElement("button");
			btn.classList.add("smaller");
			btn.textContent = i;
			btn.addEventListener("click", () => {
				universal.send(universal.events.keypress, {
					event: {isTrusted: true},
					btn: {
						type: "fd.profile",
						data: {
							profile: i
						}
					}
				})
			})
			fc.appendChild(btn)
		}

});

await universal.init("Main");

window.onscroll = () => {
	window.scrollTo(0, 0);
};

const pageLock = document.querySelector("#lock");
const threshold = 50;
const checkDirection = (range) => {
	if (pageLock.checked) return;
	const direction = Math.sign(range);
	if (Math.abs(range) >= threshold) {
		if (direction > 0) universal.decrementPage();
		else universal.incrementPage();
	}
};

document.addEventListener("keydown", (ev) => {
	if (ev.key === "ArrowLeft") {
		universal.decrementPage();
	} else if (ev.key === "ArrowRight") {
		universal.incrementPage();
	}
});

if (universal.config.profile !== universal.load("profile")) {
	universal.save("profile", universal.config.profile);
	universal.setPage(0);
}

const lcfg = universal.getServerFlags();
document.documentElement.style.setProperty(
	"--font-size",
	`${lcfg["font-size"]}px`,
);
document.documentElement.style.setProperty(
	"--tile-width",
	`${lcfg.buttonSize}rem`,
);
document.documentElement.style.setProperty(
	"--tile-height",
	`${lcfg.buttonSize}rem`,
);
document.documentElement.style.setProperty(
	"--tile-columns",
	`repeat(${lcfg.tileCols ? lcfg.tileCols : "5"}, 2fr)`,
);

let touchstartX = 0;
let touchendX = 2500;

window.addEventListener("touchstart", (e) => {
	touchstartX = e.changedTouches[0].screenX;
});

function checkPortrait() {
	const isPortrait = window.innerHeight >= window.innerWidth;
	if(isPortrait) {
		universal.keys.classList.add("vertical");
	} else {
		if(universal.keys.classList.contains("vertical")) 
			universal.keys.classList.remove("vertical");
	}
}

window.addEventListener("resize", checkPortrait);

universal.listenFor('launch', () => {
	checkPortrait();
})
checkPortrait();

window.addEventListener("mousedown", (e) => {
	touchstartX = e.screenX;
});

document.addEventListener("mouseup", (e) => {
	touchendX = e.screenX;
	checkDirection(touchendX - touchstartX);
});

document.addEventListener("touchend", (e) => {
	touchendX = e.changedTouches[0].screenX;
	checkDirection(touchendX - touchstartX);
});

if (
	universal.getServerFlags()["app.freedeck.last_changelog_viewed"] !==
	universal._information.version.raw
) {
	universal.sendToast("Check your computer for the changelog!", "Freedeck");
}
