import { UI } from "../../client/scripts/ui";

export default function eventsHandler(universal, user) {
	return new Promise((resolve, reject) => {
		universal.CLU("Event Handler", "Creating event handlers...");

		universal.on(universal.events.login.unauthorized, () =>
			universal.sendToast("You are not authenticated!"),
		);

		universal.on(universal.events.login.session_validation_failure, () =>
			universal.sendToast(
				"Login not allowed! Session could not be verified against server.",
			),
		);

		universal.on(universal.events.companion.set_theme, (theme) => {
			universal.theming.setTheme(theme, false);
		});

		universal.on(universal.events.companion.set_profile, (data) => {
			universal.config.profile = data;
			UI.reloadProfile();
			UI.reloadSounds();
			universal.sendEvent("profile", data);
		});

		universal.on(universal.events.keypress, (interaction) => {
			if (!user.includes("Companion")) return;
			if (interaction.type === "fd.stopall") {
				universal.audioClient.stopAll();
				return;
			}
			universal.sendEvent("button", interaction);
			
			if (interaction.type !== "fd.sound") return;
			universal.reloadProfile();
			// get name from universal.app_sounds with uuid
			const a = universal.app_sounds.filter((snd) => {
				const k = Object.keys(snd)[0];
				return snd[k].uuid === interaction.uuid;
			})[0];

			if (!universal.load("playback-mode")) {
				universal.save("playback-mode", "play_over");
			}
			universal.audioClient.play({
				file: `${interaction.data.path}/${interaction.data.file}`,
				name: Object.keys(a)[0],
				channel: universal.audioClient.channels.cable,
			});
			universal.audioClient.play({
				file: `${interaction.data.path}/${interaction.data.file}`,
				name: Object.keys(a)[0],
				channel: universal.audioClient.channels.monitor,
			});
		});

		universal.on(universal.events.default.recompile, () => {
			window.location.href = `/new-connect.html?id=${user}`;
		});

		universal.on(universal.events.default.log, (data) => {
			console.log(`${data.sender}: ${data.data}`);
		});

		function handoffApiNotif(dat) {
			if (dat.data === "Authorize" && dat.incoming && universal.name === 'Companion') {
				showPick(
					`${dat.incoming.appInformation.title} wants to connect to your Freedeck!`,
					[
						{
							value: "true",
							name: "Authorize",
						},
						{
							value: "false",
							name: "Deny",
						},
					],
					({value}) => {
						universal.send(
							universal.events.rpc.reply,
							JSON.stringify({
								id: dat.incoming.appInformation.id,
								nonce: dat.incoming.nonce,
								value: value.value,
							})
						);
					},
					dat.incoming.appInformation.authorizationMessage,
					false
				);
				return;
			}
			if(dat.sender === 'handoff-api' && dat.data.startsWith("hid.c ")) {
				const requestId = notification.data.split("hid.c ")[1].split(" |")[0];
        const requestData = JSON.parse(notification.data.split(`hid.c ${requestId} |`)[1]);				
				switch(requestId) {
					case 'ui-sound': {
						universal.uiSounds.playSound(requestData.sound);		
						break;
					}
				}
				return;
			}
		};

		universal.on(universal.events.default.notif, (data) => {
			if (data.incoming) return;
			if (data.sender === 'handoff-api') {
				handoffApiNotif(data);
				return;
			};
			if (!data.isCon) {
				universal.sendToast(`${data.data}`, data.sender);
			}
			if (data.isCon) universal.sendEvent("notif", data);
		});

		universal._socket.on("disconnect", () => {
			universal.connected = false;
			universal.sendToast("Disconnected from server.", "Server");
			universal.lastRetry = new Date();
			const retryLoop = setInterval(() => {
				universal.sendToast("Attempting to reconnect...");
				universal.reconnect();
				setTimeout(() => {
					if (universal.connected === true) {
						clearInterval(retryLoop);
					}
				}, 1500);
			}, 2000);
		});

		universal.on(universal.events.login.login_data_ack, (data) => {
			universal._loginAllowed = data;
		});
		universal.on(universal.events.default.reload, () =>
			window.location.reload(),
		);

		universal.on(universal.events.default.config_changed, (e) => {
			document.documentElement.style.setProperty(
				"--font-size",
				`${e["font-size"]}px`,
			);
			if(universal.name !== "Companion") {
				document.documentElement.style.setProperty(
					"--tile-width",
					`${e.buttonSize}rem`,
				);
				document.documentElement.style.setProperty(
					"--tile-height",
					`${e.buttonSize}rem`,
				);
			}
			let tc = "repeat(5, 2fr)";
			if (e.tileCols) tc = tc.replace("5", e.tileCols);
			universal.save("nopreset", e.nopreset);
			document.documentElement.style.setProperty("--tile-columns", tc);
			universal.lclCfg = () => e;
			universal.lclCfg().iconCountPerPage = Number.parseInt(e.iconCountPerPage);
			universal.sendEvent("local-config", e);
			UI.reloadSounds();
		});

		universal.on(universal.events.default.reload_sounds, (profileData) => {
			universal.config.profiles[universal.config.profile] = profileData;
			UI.reloadSounds();
		});

		universal.on(universal.events.default.login, (auth) => {
			universal.authStatus = auth;
			if (auth === false) {
				universal.sendToast("Incorrect password!");
				if (document.querySelector("#login-dialog"))
					document.querySelector("#login-dialog").style.display = "flex";
			} else {
			}
			universal.sendEvent("auth", auth);
		});

		universal.sendEvent("init");
		universal.CLU("Event Handler", "Created event handlers, sending init event.");
		
		const hookType = universal.name === "Main" ? "client" : "companion";
		universal.CLU("Event Handler", "Loading hooks...");
		let hookCount = 0;
		for(const e of document.querySelectorAll(".fd-hook")) e.remove();
		for (const plugin of Object.keys(universal.plugins)) {
			const data = universal.plugins[plugin];
			for (const hook of data.hooks.filter(
				(ref) => ref.type === (universal.name === "Main" ? 0 : 1),
			)) {
				const scr = document.createElement("script");
				scr.classList.add("fd-hook");
				scr.classList.add(`fd-hook-${hookType}`);
				scr.src = `/user-data/hooks/${hook.name}`;
				universal.CLU("Event Handler", `Loaded ${hookType} hook: ${hook.name}`);
				hookCount++;
				document.body.appendChild(scr);
			}
		}
		universal.CLU("Event Handler", `Loaded ${hookCount} ${hookType} hooks from ${Object.keys(universal.plugins).length} plugins.`);
		universal.sendEvent("loadHooks");
		universal.CLU("Event Handler", "Tell plugins that their hooks are loaded.");
		resolve(true);
	});
}
