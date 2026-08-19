function handleSound(interaction) {
	universal.reloadProfile();
	// get name from universal.app_tiles with uuid
	const a = universal.app_tiles.filter((snd) => {
		const k = Object.keys(snd)[0];
		return snd[k].uuid === interaction.uuid;
	})[0];

	if (!universal.load("playback-mode")) {
		universal.save("playback-mode", "play_over");
	}
	if (interaction.data.hold === "true") {
		for (const sound of universal.audioClient._nowPlaying) {
			if (sound.dataset.bind === interaction.uuid) {
				return;
			}
		}
	}
	universal.audioClient.play({
		file: `${interaction.data.path}/${interaction.data.file}`,
		name: Object.keys(a)[0],
		channel: universal.audioClient.channels.cable,
		bind: interaction.uuid,
	});
	universal.audioClient.play({
		file: `${interaction.data.path}/${interaction.data.file}`,
		name: Object.keys(a)[0],
		channel: universal.audioClient.channels.monitor,
		bind: interaction.uuid,
	});
}

function handlePress(interaction) {
	universal.audioClient.stopAll();
}

function handleSoundboard(universal) {
	universal.listenFor("button-fd.stopall", handlePress);
	universal.listenFor("button-fd.sound", handleSound);
}

export { handleSoundboard };
