import { loadData } from "../data.js";
import EditorViewLogic from "./EditorViewLogic.js";

const audioFile = document.querySelector("#audio-file");
const type = document.querySelector("#type");
const editorButton = document.querySelector("#editor-btn");
const editorAudiofileView = document.querySelector(".section-audiofile");
const editorControlView = document.querySelector(".section-control");

const selector_audiofile = document.querySelector("#section-t_audio");
const selector_control = document.querySelector("#section-t_ctrl");

const true_selector_control = document.querySelector(
	"#section-control-selector",
);

selector_audiofile.onclick = () => {
	editorAudiofileView.style.display = "flex";
	editorControlView.style.display = "none";
	const intr = JSON.parse(editorButton.getAttribute("data-interaction"));
	intr.type = "fd.sound";
	editorButton.setAttribute("data-interaction", JSON.stringify(intr));
};

selector_control.onclick = () => {
	editorAudiofileView.style.display = "none";
	editorControlView.style.display = "flex";
	true_selector_control.selectedIndex = 0;
	true_selector_control.dispatchEvent(new Event("change"));
};

const featureFlags = [true, false, false, false];

const availableTypes = [
	["fd.stopall", {}, "button"],
	[
		"fd.sb.pitch",
		{ min: 0, max: 100, value: 0, direction: "vertical" },
		"slider",
	],
	[
		"fd.sb.vol.out",
		{ min: 0, max: 100, value: 0, direction: "vertical" },
		"slider",
	],
	[
		"fd.sb.vol.mon",
		{ min: 0, max: 100, value: 0, direction: "vertical" },
		"slider",
	],
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
	const type = availableTypes[i];
	// This probably isn't the best... but we'll leave it for now.
	const intr = JSON.parse(editorButton.getAttribute("data-interaction"));
	intr.type = type[0];
	intr.data = { ...intr.data, ...type[1] };
	intr.renderType = type[2];
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

		this.setOnRun(({ interactionData }) => {
			audioFile.innerText = interactionData.data.file;
			if (interactionData.type === "fd.sound") {
				editorAudiofileView.style.display = "flex";
				editorControlView.style.display = "none";
			} else {
				editorAudiofileView.style.display = "none";
				editorControlView.style.display = "flex";
				let i = 0;
				for (const [type, ,] of availableTypes) {
					if (type === interactionData.type) {
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
			type.value = "fd.sound";
		});
	}
}

function setupLibraryFor(type) {
	if (type === "icon") {
		document.querySelector("#library-view-sounds").style.display = "none";
		document.querySelector("#library-view-icons").style.display = "block";
		document.querySelector("#library-view-sounds").open = false;
		document.querySelector("#library-view-icons").open = true;
		document.querySelector(".uploads-0").style.display = "none";
		document.querySelector("#uploads-0-title").style.display = "none";
		document.querySelector(".uploads-1").style.display = "flex";
		document.querySelector("#uploads-1-title").style.display = "block";
		document.querySelector("#library > body> center p").textContent =
			"Select an icon to use, or upload a new one!";
		document.querySelector("#library > body> h1").textContent =
			"Available Icons";
		document.querySelector(".save-changes").style.display = "block";
	} else if (type === "sound") {
		document.querySelector("#library-view-sounds").style.display = "block";
		document.querySelector("#library-view-icons").style.display = "none";
		document.querySelector("#library-view-sounds").open = true;
		document.querySelector("#library-view-icons").open = false;
		document.querySelector(".uploads-0").style.display = "flex";
		document.querySelector("#uploads-0-title").style.display = "block";
		document.querySelector(".uploads-1").style.display = "none";
		document.querySelector("#uploads-1-title").style.display = "none";
		document.querySelector("#library > body> center p").textContent =
			"Select an sound to use, or upload a new one!";
		document.querySelector("#library > body> h1").textContent =
			"Available Sounds";
		document.querySelector(".save-changes").style.display = "block";
	} else {
		document.querySelector("#library-view-sounds").style.display = "block";
		document.querySelector("#library-view-icons").style.display = "block";
		document.querySelector("#library-view-sounds").open = false;
		document.querySelector("#library-view-icons").open = false;
		document.querySelector(".uploads-0").style.display = "flex";
		document.querySelector("#uploads-0-title").style.display = "block";
		document.querySelector(".uploads-1").style.display = "flex";
		document.querySelector("#uploads-1-title").style.display = "block";
		document.querySelector("#library > body> center p").textContent =
			"Here you will find every sound or icon you've uploaded.";
		document.querySelector("#library > body> h1").textContent = "Library";
		document.querySelector(".save-changes").style.display = "none";
	}
}

document.querySelector("#upload-sound").onclick = () => {
	document.querySelector("#sidebar").style.right = "-20%";
	universal.uiSounds.playSound("int_confirm");
	const ito = JSON.parse(editorButton.dataset.interaction);
	universal.listenForOnce("library_load", () => {
		setupLibraryFor("sound");
	});
	universal.listenForOnce("library_paint", () => {
		const preselectedElement = document.querySelector(
			`.upload[data-name='${ito.data.file}']`,
		);
		if (ito.data.file && preselectedElement)
			preselectedElement.classList.add("glow");
		for (const uploadedIcon of document.querySelectorAll(
			".uploads-0 .upload",
		)) {
			uploadedIcon.onclick = () => {
				for (const glowingIcon of document.querySelectorAll(".glow")) {
					glowingIcon.classList.remove("glow");
				}
				uploadedIcon.classList.add("glow");

				ito.data.file = uploadedIcon.dataset.name;
				ito.data.path = "/sounds/";
				editorButton.setAttribute("data-interaction", JSON.stringify(ito));
				loadData(ito.data);
				document.querySelector("#file.editor-data").value =
					uploadedIcon.dataset.name;
				document.querySelector("#path.editor-data").value = "/sounds/";
				document.querySelector("#audio-file").innerText =
					uploadedIcon.dataset.name;

				universal.uiSounds.playSound("int_yes");
			};
		}
	});
	universal.listenForOnce("library_save", () => {
		document.querySelector("#sidebar").style.right = "0";
	});
	universal.vopen("library");
};

document.querySelector("#quick-upload-sound").onclick = () => {
	universal.uiSounds.playSound("int_confirm");

	universal.listenForOnce("library_load", () => {
		universal._Uploads_New(1, true);
		setupLibraryFor("sound");
	});

	universal.vopen("library");
};

document.querySelector("#upload-icon").onclick = (e) => {
	universal.uiSounds.playSound("int_confirm");
	const ito = JSON.parse(editorButton.dataset.interaction);
	universal.listenForOnce("library_load", () => {
		setupLibraryFor("icon");
	});
	universal.listenForOnce("library_paint", () => {
		const preselectedElement = document.querySelector(
			`.upload[data-name='${ito.data.icon.split("/icons/")[1]}']`,
		);
		if (ito.data.icon && preselectedElement)
			preselectedElement.classList.add("glow");
		for (const uploadedIcon of document.querySelectorAll(
			".uploads-1 .upload",
		)) {
			uploadedIcon.onclick = () => {
				for (const glowingIcon of document.querySelectorAll(".glow")) {
					glowingIcon.classList.remove("glow");
				}
				uploadedIcon.classList.add("glow");

				ito.data.icon = `/icons/${uploadedIcon.dataset.name}`;
				editorButton.setAttribute("data-interaction", JSON.stringify(ito));
				editorButton.style.backgroundImage = `url("${`/icons/${uploadedIcon.dataset.name}`}")`;
				loadData(ito.data);
				universal.uiSounds.playSound("uploaded");
			};
		}
	});
	universal.vopen("library");
};

export default Sound;
