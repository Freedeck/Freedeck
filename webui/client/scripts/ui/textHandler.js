/**
 * Create a "text" Tile.
 * @param {Tile} snd Freedeck Button Config
 * @param {DisplayedTile} keyObject Key Object
 * @param {RawTile} raw Raw Key Data
 */
export default function (snd, keyObject, raw) {
	const k = Object.keys(raw)[0];
	keyObject.innerHTML = `<div class="button-text"><p>${universal.cleanHTML(k)}</p></div>`;
}
