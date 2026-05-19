function initialize() {
	universal.CLU("Boot / UI Sounds", "Set enabled");
	uiSoundEngine.reload();
	universal.CLU("Boot / UI Sounds", "Reloaded sounds");
}

function reload() {
	if (!uiSoundEngine.enabled()) return;
	uiSoundEngine.currentSoundpack =
		universal.load("soundpack") || "futuristic.soundpack";
	universal.CLU("Boot / UI Sounds", "Auto-detecting current soundpack");
	uiSoundEngine.load(uiSoundEngine.currentSoundpack).then(() => {
		universal.CLU("Boot / UI Sounds", "Loaded current soundpack.");
		playSound("page_enter");
	});
}

async function load(soundpack) {
	universal.CLU("Boot / UI Sounds", `Loading soundpack ${soundpack}`);
	const res = await fetch(
		`/app/shared/sounds/${soundpack}/manifest.fdsp.json`,
	).catch((err) => {
		console.error(err);
		universal.sendToast(
			"Failed to load soundpack. Defaulting to futuristic.",
			"Freedeck",
		);
		uiSoundEngine.currentSoundpack = "futuristic.soundpack";
		reload();
	});
	universal.CLU("Boot / UI Sounds", "Fetched manifest");
	const data = await res.json();
	uiSoundEngine.sounds = data.sounds;
	uiSoundEngine.info = data.info;
	return true;
}

async function playSound(name) {
	if (!uiSoundEngine.enabled()) return;
	return universal.audioClient.play({
		file: `/app/shared/sounds/${uiSoundEngine.info.id}/${uiSoundEngine.sounds[name]}`,
		name,
		channel: universal.audioClient.channels.ui,
		stopPrevious: false,
		volume: 0.5,
	});
}

const uiSoundEngine = {
	enabled: () => universal.getServerFlags()["app.freedeck.ui_sounds"],
	currentSoundpack: "futuristic.soundpack",
	info: {},
	sounds: {},
	playing: [],
	initialize,
	reload,
	load,
	playSound,
};

export default uiSoundEngine;
