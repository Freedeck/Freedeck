import { translationKey } from "../../../shared/localization";

/**
 * Create a "button" Tile.
 * @param {Tile} snd Freedeck Button Config
 * @param {DisplayedTile} tileElement Key Object
 * @param {RawTile} raw Raw Key Data
 */
export default function (snd, tileElement, raw) {
	const k = Object.keys(raw)[0];
	if (snd.data.primaryIcon === "true") {
		tileElement.innerHTML = ``;
	} else {
		tileElement.innerHTML = `<div class="button-text"><p>${universal.cleanHTML(k)}</div></p>`;
	}
	if (snd.data.hold === "true" && universal.name !== "Companion") {
		const activationMs = 5;
		const startHolding = (e) => {
			tileElement.dataset.time = 0;
			tileElement.dataset.holding = true;
			tileElement.interval = setInterval(() => {
				if (Number.parseInt(tileElement.dataset.time) >= activationMs) {
					send(e);
					tileElement.dataset.time = 0;
				}
				tileElement.dataset.time =
					Number.parseInt(tileElement.dataset.time) + 1;
			}, 1);
		};

		const stopHolding = (e) => {
			tileElement.dataset.holding = false;
			clearInterval(tileElement.interval);
			if (Number.parseInt(tileElement.dataset.time) >= activationMs) {
				send(e);
			}
			tileElement.dataset.time = 0;
		};

		tileElement.onmousedown = startHolding;
		tileElement.onmouseup = stopHolding;
		tileElement.onmouseleave = stopHolding;
		tileElement.ontouchstart = startHolding;
		tileElement.ontouchend = stopHolding;
		tileElement.ontouchcancel = stopHolding;
		tileElement.ontouchleave = stopHolding;
		const send = (e) => {
			universal.send(universal.events.keypress, {
				event: e,
				btn: snd,
			});
		};
	}
	if (snd.data.longPress === "true" && universal.name !== "Companion") {
		const countdownTime = Number.parseInt(
			universal.getServerFlags().longPressTime
				? universal.getServerFlags().longPressTime
				: 3,
		);
		const startHolding = (e) => {
			tileElement.dataset.time = 0;
			tileElement.dataset.holding = true;
			tileElement.style.backgroundColor = "rgba(0, 0, 0, 0)";
			tileElement.style.transform = "scale(0.75)";
			tileElement.style.fontSize = "2rem";
			tileElement.querySelector(".button-text").querySelector("p").innerText =
				countdownTime;
			tileElement.interval = setInterval(() => {
				tileElement.dataset.time =
					Number.parseInt(tileElement.dataset.time) + 1;
				tileElement.style.backgroundColor = `rgba(0, 0, 0, ${Number.parseInt(tileElement.dataset.time) * 0.1 + 0.1})`;
				tileElement.style.transform = `scale(${0.75 + Number.parseInt(tileElement.dataset.time) * 0.05})`;
				tileElement.querySelector(".button-text").querySelector("p").innerText =
					countdownTime - Number.parseInt(tileElement.dataset.time);
				if (Number.parseInt(tileElement.dataset.time) >= countdownTime) {
					stopHolding(e);
					clearInterval(tileElement.interval);
				}
			}, 1000);
		};

		const stopHolding = (e) => {
			tileElement.dataset.holding = false;
			tileElement.style.backgroundColor = snd.data.color ? snd.data.color : "";
			tileElement.style.transform = "";
			tileElement.style.fontSize = "";
			tileElement.querySelector(".button-text").querySelector("p").innerText =
				universal.cleanHTML(k);
			clearInterval(tileElement.interval);
			if (Number.parseInt(tileElement.dataset.time) >= countdownTime) {
				send(e);
			}
			tileElement.dataset.time = 0;
		};

		tileElement.onmousedown = startHolding;
		tileElement.onmouseup = stopHolding;
		tileElement.onmouseleave = stopHolding;
		tileElement.ontouchstart = startHolding;
		tileElement.ontouchend = stopHolding;
		tileElement.ontouchcancel = stopHolding;
		tileElement.ontouchleave = stopHolding;
		const send = (e) => {
			universal.send(universal.events.keypress, {
				event: e,
				btn: snd,
			});
		};
	} else {
		if (universal.name === "Companion") {
			tileElement.onpointerup = (ev) => {
				if (!universal.flags.isEnabled("try_buttons")) {
					universal.sendToast(
						translationKey("app.error.test_buttons_is_off"),
						"Freedeck",
					);
					return;
				}
				if (ev.which !== 1) return;
				universal.send(universal.events.keypress, {
					event: ev,
					btn: snd,
				});
			};
		} else if (snd.data.onRelease === "true") {
			tileElement.onpointerup = (ev) => {
				if (ev.which !== 1) return;
				universal.send(universal.events.keypress, {
					event: ev,
					btn: snd,
				});
			};
		} else {
			tileElement.onpointerdown = (ev) => {
				if (universal.name === "Companion") {
					if (!universal.flags.isEnabled("try_buttons")) {
						universal.sendToast(
							translationKey("app.error.test_buttons_is_off"),
							"Freedeck",
						);
						return;
					}
				}
				if (ev.which !== 1) return;
				universal.send(universal.events.keypress, {
					event: ev,
					btn: snd,
				});
			};
		}
	}
}
