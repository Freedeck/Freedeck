const path = require("node:path");
const fs = require("node:fs");
const iconRegistry = require("@managers/iconRegistry");

/**
 * Generic Icon class. Applies to literally anything. No rules.  
 * Uses the builder pattern.
 */
class IconBuilder {
  img;
  identifier;
  isStatic = true;
  types = [];
  
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
    return this;
  }

  /**
   * Apply this icon to any type.
   * @param {String} type The Freedeck Tile type that this icon will apply to.
   */
  applyTo(type) {
    this.types.push(type);
    return this;
  }
}

module.exports = {IconBuilder};