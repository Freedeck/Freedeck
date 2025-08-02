const path = require("node:path");
const fs = require("node:fs");
const iconRegistry = require("@managers/iconRegistry");

/**
 * Generic Icon class. Applies to literally anything. No rules.
 */
class Icon {
  img;
  identifier;
  isStatic = true;
  /**
   * Create a generic Icon, with only an image.
   * @param {String} img Relative path to the image file.
   */
  constructor(identifier, img) {
    this.img = img;
    this.identifier = identifier;
  }

  /**
   * Register your Icon (move the image to a web-public directory & add to registry)
   * @param {String} package_identifier The name of your `.fdpackage`, to be identified
   */
  register(package_identifier) {
    iconRegistry.add(this, package_identifier);
  }
}

/**
 * Static icon class. Apply to only types, no dynamic rules.
 */
class StaticIcon extends Icon {
  types = [];
  /**
   * Apply this icon to any type.
   * @param {String} type The Freedeck Tile type that this icon will apply to.
   */
  applyTo(type) {
    this.types.push(type);
  }
}

/**
 * Dynamic icon class. Apply based on a rule that takes a button interaction.  
 * There really are no rules, but keep in mind you want your rule parsers to be somewhat fast.
 */
class DynamicIcon extends Icon {

}

module.exports = {Icon, StaticIcon, DynamicIcon};