import { SidebarSection, SidebarSlider, SidebarButton, SidebarSelect } from "../SidebarSection";
import { translationKey } from "../../../../shared/localization";

const style = new SidebarSection(translationKey("sidebars.left.soundboard.title"), "Soundboard");

style.children.push({build:()=>{
  const d = document.createElement("div");
  d.id = "np-sb";
  return d;
}})

universal.listenFor("now-playing", (data) => {
	const { name, channel } = data;
	if (
		channel === universal.audioClient.channels.ui ||
		channel === universal.audioClient.channels.monitor
	)
		return;
	const newEle = document.createElement("div");
	const filname = name.replace(/[^a-zA-Z0-9]/g, "");
	newEle.className = `np s-${filname}`;
	newEle.innerText = name;
	document.querySelector("#np-sb").appendChild(newEle);
});

style.children.push(new SidebarButton(translationKey("sidebars.left.soundboard.stop_all"), (e) => {universal.audioClient.stopAll();}));

style.children.push(new SidebarSlider(translationKey("sidebars.left.soundboard.sliders.pitch"), "pitch", translationKey("sidebars.left.soundboard.sliders.pitch.unit"), "0.1", "2", "1", (e) => {
  universal.audioClient.setPitch(e.target.value)
}, () => {
  universal.audioClient.setPitch(1);
  setValue("#pitch", 1);
}, 0.1));

style.children.push(new SidebarSlider(translationKey("sidebars.left.soundboard.sliders.volume.output"), "v", translationKey("sidebars.left.soundboard.sliders.volume.unit"), "0", "100", "100", (e) => {
  universal.audioClient.setVolume(e.target.value / 100, universal.audioClient.channels.cable)
}, () => {
  universal.audioClient.setVolume(1, universal.audioClient.channels.cable)
  setValue("#v", 100);
}));

style.children.push(new SidebarSlider(translationKey("sidebars.left.soundboard.sliders.volume.monitor"), "v", translationKey("sidebars.left.soundboard.sliders.volume.unit"), "0", "100", "100", (e) => {
  universal.audioClient.setVolume(e.target.value / 100, universal.audioClient.channels.monitor)
}, () => {
  universal.audioClient.setVolume(1, universal.audioClient.channels.monitor)
  setValue("#mv", 100);
}));


const playbackModes = [
	{
		label: translationKey("sidebars.left.soundboard.mode.stop_previous"),
		value: "stop_prev",
	},
	{
		label: translationKey("sidebars.left.soundboard.mode.play_over"),
		value: "play_over",
	},
];

const playbackModeSelect = new SidebarSelect(translationKey("sidebars.left.soundboard.mode.title"), "es-playback", (e) => {
  universal.save("playback-mode", e.target.value);
  console.log(`Playback mode set to ${e.target.value}`);
}, universal.load("playback-mode"));

playbackModeSelect.setupValues = async () => {
  return playbackModes.map((mode) => mode.value);
}

playbackModeSelect.setupLabels = async () => {
  return playbackModes.map((mode) => mode.label);
}

style.children.push(playbackModeSelect);

document.querySelector(".sidebar").appendChild(style.build());

universal.listenFor("loadHooks", () => {
  if(universal.load("pitch"))
    setValue("#pitch", Number.parseInt(universal.load("pitch")));
  if(universal.load("vol-0"))
    setValue("#v", universal.load("vol-0") * 100);
	if(universal.load("vol-1"))
		setValue("#mv", universal.load("vol-1") * 100);
})

function setValue(id, val) {
	document.querySelector(id).value = val;
	document
		.querySelector(id)
		.parentElement.querySelector(".fdc-slider-value").innerText =
		val + (document.querySelector(id).getAttribute("postfix") || "");
}