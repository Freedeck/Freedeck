export default class EditorView {
  /**@type {any} Any universal unique ID. */
  id;
  /**@type {EditorViewLogic} The EditorViewLogic used for this view */
  logic;
  /**@type {string} A translation key to use for the no-action screen. */
  noActionTranslationKey;
  /**@type {string} Path to the icon */
  icon;
  /**
   * Create an EditorView
   * @param {any} id Any universal unique ID.
   * @param {EditorViewLogic} logic The EditorViewLogic used for this view
   * @param {string} noActionTranslationKey A translation key to use for the no-action screen.
   * @param {string} icon Path to the icon
   */
  constructor(id, logic, noActionTranslationKey, icon) {
    this.id = id;
    this.logic = logic;
    this.noActionTranslationKey = noActionTranslationKey;
    this.icon = icon;
  }
}