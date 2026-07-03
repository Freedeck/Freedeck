const UAE = {
	_nowPlaying: [],
	_end: (event) => {
		universal.audioClient._nowPlaying.splice(
			universal.audioClient._nowPlaying.indexOf(event.target),
			1,
		);
		universal.updatePlaying();
	},
	_player: {
		normalVol: 1,
		monitorVol: 1,
		pitch: 1,
	},
	sinkManager: {
		types: {
			monitor: 0,
			vbcable: 1,
		},
		sinks: [],
		devices: [],
		reloadDevices: async () => {
			if (!navigator.mediaDevices?.enumerateDevices) {
				console.log("enumerateDevices() not supported.");
			} else {
				const devices = [];
				navigator.mediaDevices
					.enumerateDevices()
					.then((devices) =>
						devices.filter((device) => device.kind === "audiooutput"),
					)
					.catch((err) => {
						console.error(err);
					});
				for (const device of devices) {
					UAE.sinkManager.devices.push(device);
					universal.CLU(
						"Boot / Universal:AudioEngine",
						"Created monitor potential devices",
					);
				}
			}
		},
		initialize: () => {
			UAE.sinkManager.reloadDevices();
			if (universal.exists("audio/sinks")) {
				UAE.sinkManager.sinks = universal.loadObject("audio/sinks");
				universal.CLU("Boot / Universal:AudioEngine", "Loaded audio/sinks");
			} else {
				universal.CLU(
					"Boot / Universal:AudioEngine",
					"No audio/sinks found, creating new",
				);
				universal.saveObject("audio/sinks", UAE.sinkManager.sinks);
			}
		},
		addAndRemoveSink: async (type, id, remove) => {
			UAE.sinkManager.sinks = UAE.sinkManager.sinks.filter(
				(sink) => sink.id !== remove,
			);
			universal.CLU("Boot / Universal:AudioEngine", "Removed sink");
			UAE.sinkManager.addSink(type, id);
		},
		removeSink: async (id) => {
			UAE.sinkManager.sinks = UAE.sinkManager.sinks.filter(
				(sink) => sink.id !== id,
			);
			universal.CLU("Boot / Universal:AudioEngine", "Removed sink");
			universal.saveObject("audio/sinks", UAE.sinkManager.sinks);
		},
		addSink: async (type, id) => {
			UAE.sinkManager.sinks.push({ type, id });
			universal.CLU("Boot / Universal:AudioEngine", "Added sink");
			universal.saveObject("audio/sinks", UAE.sinkManager.sinks);
		},
		getSinksForType: (type) => {
			return UAE.sinkManager.sinks.filter((sink) => sink.type === type);
		},
		hasSink: (id) => {
			return UAE.sinkManager.sinks.some((sink) => sink.id === id);
		},
	},
	stopAll: async () => {
		for (const audio of universal.audioClient._nowPlaying) {
			try {
				await audio.pause();
			} catch (err) {
				// "waah waah waah noo you cant just abuse audio api" -companion
				// > i dont care :trole:
			}
		}
	},
	setPitch: (pitch) => {
		universal.audioClient._player.pitch = pitch;
		for (const audio of universal.audioClient._nowPlaying) {
			audio.playbackRate = pitch;
		}
		universal.save("pitch", pitch);
	},
	setVolume: (vol, forChannel = UAE.channels.cable) => {
		if (forChannel === UAE.channels.monitor)
			universal.audioClient._player.monitorVol = vol;
		else universal.audioClient._player.normalVol = vol;
		for (const audio of universal.audioClient._nowPlaying) {
			if (audio.dataset.channel !== forChannel.toString()) continue;
			audio.volume = vol;
		}
		universal.save(`vol-${forChannel}`, vol);
	},
	channels: {
		cable: 0,
		monitor: 1,
		ui: 2,
	},
	sinks: [],
	initialize: () => {
		universal.CLU("Boot / Universal:AudioEngine", "Initializing audio engine");
		UAE.sinkManager.initialize();
		if (universal.exists("vb.sink")) {
			universal.audioClient.sinkManager.addSink(
				universal.audioClient.sinkManager.types.vbcable,
				universal.load("vb.sink"),
			);
			universal.remove("vb.sink");
		}
		if (universal.exists("monitor.sink")) {
			universal.audioClient.sinkManager.addSink(
				universal.audioClient.sinkManager.types.monitor,
				universal.load("monitor.sink"),
			);
			universal.remove("monitor.sink");
		}
	},
	_no_sinks: false,
	play: async ({
		file,
		name,
		stopPrevious = universal.load("playback-mode") === "stop_prev",
		volume = universal.load("vol-0F") || 1,
		pitch = universal.load("pitch") || 1,
		channel,
		bind = null,
	}) => {
		const sinks = [];
		let vol = 1;
		const ch = universal.audioClient.channels;
		if (channel === ch.monitor || channel === ch.ui) {
			for (const sink of UAE.sinkManager.getSinksForType(
				UAE.sinkManager.types.monitor,
			)) {
				sinks.push(sink.id);
			}
			vol = universal.audioClient._player.monitorVol;
			if (channel === ch.ui) vol = volume;
		} else {
			for (const sink of UAE.sinkManager.getSinksForType(
				UAE.sinkManager.types.vbcable,
			)) {
				sinks.push(sink.id);
			}
			vol = universal.audioClient._player.normalVol;
		}
		if (UAE._no_sinks) {
			await UAE._play({
				file,
				name,
				stopPrevious,
				volume: vol,
				pitch,
				channel,
				sink: null,
				bind,
			});
		}
		for (const sink of sinks) {
			try {
				await UAE._play({
					file,
					name,
					stopPrevious,
					volume: vol,
					pitch,
					channel,
					sink,
					bind,
				});
			} catch (err) {
				// Remove sink from manager
				UAE.sinkManager.removeSink(sink);
				universal.sendToast(
					"Fatal error, couldn't play audio. Removed faulty device.",
					"Audio Engine",
				);
			}
		}
	},
	_play: async ({
		file,
		name,
		stopPrevious = universal.load("playback-mode") === "stop_prev",
		volume = universal.load("vol-0") || 1,
		pitch = universal.load("pitch") || 1,
		channel,
		sink,
		bind,
	}) => {
		const ch = universal.audioClient.channels;
		const audioInstance = new Audio();
		audioInstance.src = file;
		audioInstance.load();

		if (sink != null) await audioInstance.setSinkId(sink);

		audioInstance.playbackRate = pitch;
		audioInstance.volume = volume;
		audioInstance.preservesPitch = false;

		audioInstance.dataset.bind = bind;
		audioInstance.dataset.name = name;
		audioInstance.dataset.channel = channel;
		audioInstance.dataset.monitoring = channel === ch.monitor;

		if (stopPrevious === true && channel !== ch.ui) {
			for (const audio of universal.audioClient._nowPlaying) {
				try {
					if (
						audio.dataset.name === name &&
						audio.dataset.channel === channel.toString()
					) {
						await audio.pause();
					}
				} catch (err) {
					// "waah waah waah noo you cant just abuse audio api" -companion
					// > i dont care :trole:
				}
			}
		}

		audioInstance.play();

		audioInstance.onpause = (ev) => {
			universal.sendEvent("audio-end", { audioInstance, name, channel });
			universal.audioClient._end(ev);
			audioInstance.remove();
		};

		universal.audioClient._nowPlaying.push(audioInstance);
		universal.sendEvent("now-playing", { audioInstance, name, channel, bind });
		universal.updatePlaying();
		return audioInstance;
	},
	useSinkIfExists: async (audioElem, sink, local) => {
		navigator.mediaDevices.getUserMedia({ audio: true, video: false });

		if (universal.load(sink)) await audioElem.setSinkId(universal.load(sink));
		else await audioElem.setSinkId(local);
	},
};

export default UAE;
