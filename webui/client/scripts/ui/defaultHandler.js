import { translationKey } from "../../../shared/localization";

/**
 * Create the default FD button.
 * @param {*} snd Freedeck Button Config
 * @param {*} keyObject Key Object
 * @param {*} raw Raw Key Data
 */
export default function (snd, keyObject, raw) {
	const k = Object.keys(raw)[0];
	keyObject.innerHTML = `<div class="button-text"><p>${sanitizeXSS(k)}</div></p>`;
	if (snd.data.longPress === "true" && universal.name !== "Companion") {
		const countdownTime = Number.parseInt(
			universal.lclCfg().longPressTime ? universal.lclCfg().longPressTime : 3,
		);
		const startHolding = (e) => {
			keyObject.dataset.time = 0;
			keyObject.dataset.holding = true;
			keyObject.style.backgroundColor = "rgba(0, 0, 0, 0)";
			keyObject.style.transform = "scale(0.75)";
			keyObject.style.fontSize = "2rem";
			keyObject.querySelector(".button-text").querySelector("p").innerText =
				countdownTime;
			keyObject.interval = setInterval(() => {
				keyObject.dataset.time = Number.parseInt(keyObject.dataset.time) + 1;
				keyObject.style.backgroundColor = `rgba(0, 0, 0, ${Number.parseInt(keyObject.dataset.time) * 0.1 + 0.1})`;
				keyObject.style.transform = `scale(${0.75 + Number.parseInt(keyObject.dataset.time) * 0.05})`;
				keyObject.querySelector(".button-text").querySelector("p").innerText =
					countdownTime - Number.parseInt(keyObject.dataset.time);
				if (Number.parseInt(keyObject.dataset.time) >= countdownTime) {
					stopHolding(e);
					clearInterval(keyObject.interval);
				}
			}, 1000);
		};

		const stopHolding = (e) => {
			keyObject.dataset.holding = false;
			keyObject.style.backgroundColor = snd.data.color ? snd.data.color : "";
			keyObject.style.transform = "";
			keyObject.style.fontSize = "";
			keyObject.querySelector(".button-text").querySelector("p").innerText =
				sanitizeXSS(k);
			clearInterval(keyObject.interval);
			if (Number.parseInt(keyObject.dataset.time) >= countdownTime) {
				send(e);
			}
			keyObject.dataset.time = 0;
		};

		keyObject.onmousedown = startHolding;
		keyObject.onmouseup = stopHolding;
		keyObject.onmouseleave = stopHolding;
		keyObject.ontouchstart = startHolding;
		keyObject.ontouchend = stopHolding;
		keyObject.ontouchcancel = stopHolding;
		keyObject.ontouchleave = stopHolding;
		const send = (e) => {
			universal.send(universal.events.keypress, {
				event: e,
				btn: snd,
			});
		};
	} else {
		if(universal.load("cct") === "true") return;
		if(universal.name === "Companion") {
			keyObject.onpointerup = (ev) => {
				if(!universal.flags.isEnabled("try_buttons")) {
					universal.sendToast(translationKey("app.error.test_buttons_is_off"), "Freedeck");
					return;
				}
				if (ev.which !== 1) return;
				universal.send(universal.events.keypress, {
					event: ev,
					btn: snd,
				});
			};
		} else if(snd.data.onRelease === 'true') {
			keyObject.onpointerup = (ev) => {
				if (ev.which !== 1) return;
				universal.send(universal.events.keypress, {
					event: ev,
					btn: snd,  
				});
			};
		} else {
			keyObject.onpointerdown = (ev) => {
				if(universal.name === "Companion") {
					if(!universal.flags.isEnabled("try_buttons")) {
						universal.sendToast(translationKey("app.error.test_buttons_is_off"), "Freedeck");
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
	// check if text is bigger than 2 lines (by font size)
	if (universal.lclCfg().scroll) {
		const txth = keyObject.querySelector("p");
		const size = txth.clientHeight;
		if (size > 40) {
			txth.classList.add("too-big");
		}
	}
}

const sanitizeXSS = (str) => {
	return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
