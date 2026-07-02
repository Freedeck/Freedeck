/**
 * @typedef {Object} TileData
 * @property {('true'|'false')} [showBg] - Show the background.
 * @property {('true'|'false')} [noBorder] - Show the border
 * @property {('true'|'false')} [noRounding] - Round the Tile's border
 * @property {('left'|'right'|'top'|'bottom')} [textOffset] - Where to offset the Tile's text
 * @property {('true'|'false')} [primaryIcon] - Tile is primarily to display an Icon
 * @property {('true'|'false')} [hold] - Holding sends multiple keypress events
 * @property {('true'|'false')} [longPress] - Long press required to activate
 * @property {string} [time] - Tile's intermediary long press time counter
 * @property {boolean} [holding] Tile's intermediary long press hold tracker
 * @property {('true'|'false')} [onRelease] - Activate upon release 
 * @property {string} [color] - Tile's background color in hex
 * @property {string} [file] - What file this Tile points to (fd.sound)
 * @property {string} [path] - Where the file is (fd.sound)
 * @property {string} [icon] - The Tile's icon image
 * @property {string} [macro] - What keys to press (fd.macro)
 * @property {string} [profile] - What profile to switch to (fd.profile)
 * @property {string} [app] - What app we're tracking (FDWS)
 * @property {number} [min] - Minimum value (Sliders)
 * @property {number} [max] - Maximum value (Sliders)
 * @property {number} [value] - Value of slider (Sliders)
 * @property {string} [format] - Suffix for value (Sliders)
 * @property {('horizontal'|'vertical')} [direction] - Which way to render slider (Sliders)
*/

/**
 * @typedef {HTMLDivElement} DisplayedTile
 */

/**
 * @typedef {string} TileType
 */

/**
 * @typedef {Object} Tile
 * @property {string} uuid - Unique identifier, anything but preferred UUIDv4.
 * @property {TileType} type - Type specified by plugin/provider.
 * @property {number} pos - Position in Tile space.
 * @property {TileData} data - Unique data related to a Tile.
 * @property {('text'|'button'|'slider')} renderType - How Freedeck should style your Tile. 
 * @property {string} [plugin] - Plugin providing the Tile, required if a plugin is used.
 */

/**
 * @typedef {Object} RawTile
 * @type {Object.<string, Tile>} tileName - Unique identifier, anything but preferred UUIDv4.
 */

/**
 * @typedef {('click'|'devmode'|'editor_open'|'fdc_slider'|'int_confirm'|'int_no'|'int_prompt'|'int_type'|'int_yes'|'marketloading'|'mobile_connect'|'mobile_disconnect'|'notification'|'overlay_close'|'overlay_open'|'page_down'|'page_enter'|'page_up'|'select_option'|'select_option_false'|'sidebar'|'slide_close'|'slide_open'|'step_1'|'step_2'|'step_3'|'step_4'|'uploaded'|'webpack_awaiting'|'welcome')} UISound
 */

/**
 * @typedef {Object} ModalButton
 * @property {string} text - The button's text
 * @property {function(MouseEvent): void} onclick - Event handler for onclick
 */

/**
 * @typedef {Object} GenericModal
 * @property {HTMLDialogElement} modal - The modal's container
 * @property {HTMLDivElement} content - The content inside the modal
 * @property {function(UISound): void} close - Close, and play a sound alongside (destructive)
 * @property {function(): void} hide - Hide the modal (nondestructive)
 * @property {function(): void} forceHide - No animation, just hide (nondestructive) 
 * @property {function(): void} show - Show the modal
 */

/**
 * @typedef {GenericModal} EditModal
 */

/**
 * @typedef {Object} EditCallbackParameters
 * @property {string} value - User's inputted value
 * @property {HTMLDivElement} feedback - The feedback element
 */

/**
 * @typedef {GenericModal} ProgressBar
 * @property {function(string): void} - Set the stage's title
 * @property {function(number): void} - Set the bar's progress value
 */

/**
 * @typedef {GenericModal} ConsentModal
 */

/**
 * @typedef {Object} PickModalItem
 * @property {string} name - The name of your item, used as value if display is set
 * @property {string} [display] - Display a friendlier title for your item
 */

/**
 * @typedef {GenericModal} PickModal
 */

/**
 * @typedef {Object} PickCallbackParameters
 * @property {string} value - User's inputted value
 * @property {PickModal} modal - The pick modal
 * @property {HTMLDivElement} modalFeedback - The feedback element,
 * @property {HTMLDivElement} modalContent - The modal's content.
 */

/**
 * @typedef {Object} UISoundpackInformation
 * @property {string} name - The name of the soundpack
 * @property {string} version - The version of the soundpack
 * @property {string} author - The author of the soundpack
 * @property {string} description - The description of the soundpack
 * @property {string} id - The ID (and folder name) for the soundpack
 */

/**
 * @typedef {Object} UISoundpackSounds
 * @type {Record<UISound, string>}
 */

/**
 * @typedef {Object} UISoundpack
 * @property {UISoundpackInformation} info - Information about the soundpack
 * @property {UISoundpackSounds} sounds - Where each sound is located
 */

/**
 * @typedef {Object} UISoundEngine
 * @property {function(): boolean} enabled - Are UISounds enabled?
 * @property {string} currentSoundpack - The current soundpack
 * @property {UISoundpackInformation} info - The soundpack information
 * @property {UISoundpackSounds} sounds - The soundpack sounds
 * @property {Array[HTMLAudioElement]} playing - What sounds are playing
 * @property {function(): void} initialize - Initialize the sound engine
 * @property {function(): void} reload - Reload the current soundpack
 * @property {function(string): void} load - Load a new soundpack
 * @property {function(UISound): void} playSound - Play a UISound
 */