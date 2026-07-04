import { UI } from "../../client/scripts/ui";
import { handleSoundboard } from "../tiles/soundboard";

export default async function eventsHandler(universal, user) {
	universal.CLU("Event Handler", "Creating event handlers...");

	universal.on(universal.events.login.unauthorized, () =>
		universal.sendToast("You are not authenticated!", "Freedeck"),
	);

	universal.on(universal.events.login.session_validation_failure, () =>
		universal.sendToast(
			"Login not allowed! Session could not be verified against server.",
			"Freedeck",
		),
	);

	universal.on(universal.events.companion.set_theme, (theme) => {
		universal.theming.setTheme(theme, false);
	});

	universal.on(universal.events.companion.set_profile, (data) => {
		universal.config.profile = data;
		UI.reloadProfile();
		UI.reloadTiles();
		universal.sendEvent("profile", data);
	});

	universal.on(universal.events.keypress, (interaction) => {
		if (!user.includes("Companion")) return;
		universal.sendEvent("button", interaction);
		if (interaction.type) {
			universal.sendEvent("button-" + interaction.type, interaction);
		}
	});

	universal.on(universal.events.default.recompile, () => {
		if (universal.getServerFlags()["app.freedeck.skip_boot_animation"]) {
			window.location.href = `/new-connect.html?id=${user}`;
		}
		UI.showBootLog(false);
		if (window.splashScreen) window.splashScreen.splash();
		setTimeout(() => {
			window.location.href = `/new-connect.html?id=${user}`;
		}, 500);
	});

	function handoffApiNotif(dat) {
		if (
			dat.data === "Authorize" &&
			dat.incoming &&
			universal.name === "Companion"
		) {
			window.universal.ui.show.showPick(
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
				({ value }) => {
					universal.send(
						universal.events.rpc.reply,
						JSON.stringify({
							id: dat.incoming.appInformation.id,
							nonce: dat.incoming.nonce,
							value: value.value,
						}),
					);
				},
				dat.incoming.appInformation.authorizationMessage,
				false,
			);
			return;
		}
		if (dat.sender === "handoff-api" && dat.data.startsWith("hid.c ")) {
			const requestId = notification.data.split("hid.c ")[1].split(" |")[0];
			const requestData = JSON.parse(
				notification.data.split(`hid.c ${requestId} |`)[1],
			);
			switch (requestId) {
				case "ui-sound": {
					universal.uiSounds.playSound(requestData.sound);
					break;
				}
			}
			return;
		}
	}

	universal.on(universal.events.default.notif, (data) => {
		if (data.sender === "RPC") {
			handoffApiNotif(data);
			return;
		}
		universal.sendToast(`${data.data}`, data.sender);
		universal.sendEvent("notification", data);
	});

	universal._socket.on("disconnect", () => {
		universal.connected = false;
		universal.sendToast("Disconnected from server.", "Freedeck");
		universal.lastRetry = new Date();
		const retryLoop = setInterval(() => {
			if (universal.name != "Overlay")
				universal.sendToast("Attempting to reconnect...", "Freedeck");
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
	universal.on(universal.events.default.reload, () => {
		UI.showBootLog(false);
		setTimeout(() => {
			window.location.reload();
		}, 500);
	});

	universal.on(universal.events.default.server_flag_updated, (e) => {
		document.documentElement.style.setProperty(
			"--font-size",
			`${e["font-size"]}px`,
		);
		if (universal.name !== "Companion") {
			document.documentElement.style.setProperty(
				"--tile-width",
				`${e.buttonSize}rem`,
			);
			document.documentElement.style.setProperty(
				"--tile-height",
				`${e.buttonSize}rem`,
			);
		}
		document.documentElement.style.setProperty(
			"--tile-columns",
			`repeat(${e.tileCols ? e.tileCols : "5"}, 2fr)`,
		);
		universal.getServerFlags().iconCountPerPage = Number.parseInt(
			e.iconCountPerPage,
		);
		universal.sendEvent("local-config", e);
		UI.reloadTiles();
	});

	universal.on(universal.events.default.reload_tiles, (profileData) => {
		universal.config.profiles[universal.config.profile] = profileData;
		UI.reloadTiles();
	});

	universal.on(universal.events.default.login, (auth) => {
		universal.authStatus = auth;
		if (auth === false) {
			universal.sendToast("Incorrect password!", "Authentication");
			if (document.querySelector("#login-dialog"))
				document.querySelector("#login-dialog").style.display = "flex";
		} else {
		}
		universal.sendEvent("auth", auth);
	});

	universal.on(
		universal.events.companion.set_tile_icon,
		(type, registryFilename) => {
			for (const button of document.querySelectorAll(
				".button[data-interaction]",
			)) {
				if (button.id === "editor-btn") continue;
				try {
					const dat = JSON.parse(button.getAttribute("data-interaction"));
					if (dat.type === type) {
						button.style.backgroundImage = `url("/user-data/icon-registry/${registryFilename}`;
					}
				} catch (error) {}
			}
		},
	);

	universal.sendEvent("init");
	universal.CLU("Event Handler", "Created event handlers, sending init event.");

	handleSoundboard(universal);

	if (universal.name === "Dash") return;
	const hookType = universal.name === "Main" ? "client" : "companion";
	universal.CLU("Event Handler", "Loading hooks...");
	let hookCount = 0;
	for (const e of document.querySelectorAll(".fd-hook")) e.remove();
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
	universal.CLU(
		"Event Handler",
		`Loaded ${hookCount} ${hookType} hooks from ${Object.keys(universal.plugins).length} plugins.`,
	);
	universal.sendEvent("loadHooks");
	universal.CLU("Event Handler", "Tell plugins that their hooks are loaded.");
}
