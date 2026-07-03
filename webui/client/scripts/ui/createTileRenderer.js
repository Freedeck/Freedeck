import defaultHandler from "./defaultHandler.js";
import sliderHandler from "./slider.js";
import textHandler from "./textHandler.js";
import noneHandler from "./noneHandler.js";

/**
 * Initially hand off creation of Tile elements.
 * @param {TileType} sndType The type of the button
 * @param {DisplayedTile} tileElement The Tile's element
 * @param {Tile} snd The sound object
 * @param {RawTile} rawDat The raw data
 */
export default function (sndType, tileElement, snd, rawDat) {
	if (snd.data.showBg === "true") {
		tileElement.classList.add("no-bg");
	}
	if (snd.data.noBorder === "true") {
		tileElement.classList.add("no-border");
	}
	if (snd.data.noRounding === "true") {
		tileElement.classList.add("no-rounding");
	}

	if (snd.data.textOffset) {
		if (snd.data.textOffset in ["left", "right", "top", "bottom"]) {
			tileElement.classList.add("text-offset");
			tileElement.classList.add("text-" + snd.data.textOffset + "-offset");
		}
	}

	if (sndType === "fd.sound") defaultHandler(snd, tileElement, rawDat);
	else if (sndType === "fd.none") noneHandler(snd, tileElement, rawDat);
	else {
		switch (snd.renderType) {
			case "button":
				defaultHandler(snd, tileElement, rawDat);
				break;
			case "slider":
				sliderHandler(snd, tileElement, rawDat);
				break;
			case "text":
				textHandler(snd, tileElement, rawDat);
				break;
			default:
				defaultHandler(snd, tileElement, rawDat);
				break;
		}
	}

	if (
		sndType != "fd.none" &&
		universal.getServerFlags().scroll &&
		!snd.data.primaryIcon
	) {
		const txth = tileElement.querySelector("p");
		const isVerticallyOverflowing =
			txth.scrollHeight > tileElement.clientHeight;
		const isHorizontallyOverflowing =
			txth.scrollWidth > tileElement.clientWidth;

		if (isVerticallyOverflowing || isHorizontallyOverflowing) {
			txth.classList.add("too-big");
		}
	}

	universal.sendEvent("keyRendered", { tileElement, snd, sndType, rawDat });
}
