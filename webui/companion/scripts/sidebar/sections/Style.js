import { UI } from "../../../../client/scripts/ui";
import { SidebarSection, SidebarSlider, SidebarCheck } from "../SidebarSection";
import { translationKey } from "../../../../shared/localization";

const style = new SidebarSection(translationKey("sidebars.left.style.title"), "Style");

const handleCheckFor = (e, property) => {
  universal.send(
    universal.events.default.config_changed,
		setToLocalCfg(property, e.target.checked),
	);
  universal.lclCfg()[property] = e.target.checked;
  UI.reloadSounds();
}
let fontSize = "25";
if(universal.load("ebigt") === "true") fontSize = "50";

style.children.push(new SidebarSlider(translationKey("sidebars.left.style.font_size"), "es-fs", translationKey("sidebars.left.style.font_size.unit"), "10", fontSize, "15", (e) => {
  universal.uiSounds.playSound("fdc_slider");
	document.documentElement.style.setProperty(
		"--font-size",
		`${e.target.value}px`,
	);
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("font-size", e.target.value),
	);
}, () => {
  universal.uiSounds.playSound("fdc_slider");
	document.documentElement.style.setProperty("--font-size", "15px");
	setValue("#es-fs", 15);
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("font-size", 15),
	);
}));

style.children.push(new SidebarSlider(translationKey("sidebars.left.style.tile_size"), "es-bs", translationKey("sidebars.left.style.tile_size.unit"), "1", "12", "6", (e) => {
  universal.uiSounds.playSound("fdc_slider");
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("buttonSize", e.target.value),
	);
}, () => {
  universal.uiSounds.playSound("fdc_slider");
	setValue("#es-bs", 6);
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("buttonSize", 6),
	);
}));

let iconAmount = "54";
if(universal.load("houston") === "true") iconAmount = "512";
if(universal.load("insanity") === "true") iconAmount = "1024";

let cols = "15";
if(universal.load("houston") === "true") cols = "60";
if(universal.load("insanity") === "true") cols = "120";

style.children.push(new SidebarSlider(translationKey("sidebars.left.style.tile_count"), "es-tc", translationKey("sidebars.left.style.tile_count.unit"), "3", iconAmount, "12", (e) => {
  universal.uiSounds.playSound("fdc_slider");
	const count = document.querySelectorAll(".fdc-placeholder").length;
	const diff = e.target.value - count;
	if (diff > 0) {
		universal.lclCfg().iconCountPerPage = e.target.value;
		universal.config.iconCountPerPage = e.target.value;
		UI.reloadSounds();

		universal.send(
			universal.events.default.config_changed,
			setToLocalCfg("iconCountPerPage", universal.lclCfg().iconCountPerPage),
		);
	} else {
		for (let i = 0; i < Math.abs(diff); i++) {
			const last = document.querySelector(`.button.k-${count - i - 1}`);
			last.remove();
		}
	}
}, () => {
  setValue("#es-tc", 12);
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("iconCountPerPage", 12),
	);
}));

style.children.push(new SidebarSlider(translationKey("sidebars.left.style.columns"), "es-tr", translationKey("sidebars.left.style.columns.unit"), "2", cols, "5", (e) => {
  universal.uiSounds.playSound("fdc_slider");
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("tileCols", e.target.value),
	);
	let tc = "repeat(5, 2fr)";
	if (universal.lclCfg().tileCols) tc = tc.replace("5", e.target.value);
	document.documentElement.style.setProperty("--tile-columns", tc);
}, () => {
  universal.uiSounds.playSound("fdc_slider");
	setValue("#es-tr", 5);
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("tileCols", 5),
	);
	document.documentElement.style.setProperty("--tile-columns", "repeat(5, 2fr)");
}));

style.children.push(new SidebarSlider(translationKey("sidebars.left.style.hold_time"), "es-lp", translationKey("sidebars.left.style.hold_time.unit"), "2", "6", "3", (e) => {
  universal.uiSounds.playSound("fdc_slider");
  universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("longPressTime", e.target.value),
	);
}, () => {
  universal.uiSounds.playSound("fdc_slider");
	setValue("#es-lp", 3);
	universal.send(
		universal.events.default.config_changed,
		setToLocalCfg("longPressTime", 3),
	);
}));


document.querySelector(".sidebar").appendChild(style.build());


universal.listenFor("launch", update);
update();

function update() {
	console.log(universal.lclCfg());
  setValue("#es-fs", universal.lclCfg()["font-size"]);
  setValue("#es-bs", universal.lclCfg().buttonSize);
  setValue("#es-tc", universal.lclCfg().iconCountPerPage);
  setValue("#es-tr", universal.lclCfg().tileCols);
  setValue("#es-lp", universal.lclCfg().longPressTime);
}

const setToLocalCfg = (key, value) => {
	const cfg = universal.lclCfg();
	cfg[key] = value;
	return cfg;
};

function setValue(id, val) {
	document.querySelector(id).value = val;
	document
		.querySelector(id)
		.parentElement.querySelector(".fdc-slider-value").innerText =
		val + (document.querySelector(id).getAttribute("postfix") || "");
}