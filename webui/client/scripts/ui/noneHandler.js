/**
 * Create a "none" Tile.
 * @param {Tile} snd Freedeck Button Config
 * @param {DisplayedTile} keyObject Key Object
 * @param {RawTile} raw Raw Key Data
 */
export default function (snd, keyObject, raw) {
	const k = Object.keys(raw)[0];
	keyObject.innerText = k;
	if (universal.name !== "Companion") {
		keyObject.style.opacity = 0.125;
	}
}
