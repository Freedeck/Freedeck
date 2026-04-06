import defaultHandler from "./defaultHandler.js";
import sliderHandler from "./slider.js";
import textHandler from "./textHandler.js";
import noneHandler from "./noneHandler.js";

/**
 * Other Button type handler
 * @param {*} sndType The type of the button
 * @param {*} keyObject The key object
 * @param {*} snd The sound object
 * @param {*} rawDat The raw data
 */
export default function (sndType, keyObject, snd, rawDat) {
	if (snd.data.showBg === "true") {
		keyObject.classList.add("no-bg");
	}
	if (snd.data.noBorder === "true") {
		keyObject.classList.add("no-border");
	}
	if (snd.data.noRounding === "true") {
		keyObject.classList.add("no-rounding");
	}

	if (snd.data.textOffset) {
		if (snd.data.textOffset in ["left", "right", "top", "bottom"]) {
			keyObject.classList.add("text-offset");
			keyObject.classList.add("text-" + snd.data.textOffset + "-offset");
		}
	}

	if (sndType === "fd.sound") defaultHandler(snd, keyObject, rawDat);
	else if (sndType === "fd.none") noneHandler(snd, keyObject, rawDat, true);
	else {
		switch (snd.renderType) {
			case "button":
				defaultHandler(snd, keyObject, rawDat);
				break;
			case "slider":
				sliderHandler(snd, keyObject, rawDat);
				break;
			case "text":
				textHandler(snd, keyObject, rawDat);
				break;
			default:
				defaultHandler(snd, keyObject, rawDat);
				break;
		}
	}
	universal.sendEvent("keyRendered", { keyObject, snd, sndType, rawDat });
}
