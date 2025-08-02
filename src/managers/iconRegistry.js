const debug = require("$/debug");
const picocolors = require("$/picocolors");
const fs = require('node:fs');
const { paths } = require("../routers/static");
const path = require("node:path");

const iconRegistry = {
  map: {},
  /**
   * Add an icon to the internal registry
   * @param {Icon} icon The icon to add to the registry
   */
  add: (icon, packageExtractionPath) => {
    iconRegistry.map[icon.identifier] = icon;
    if(!fs.existsSync(`${paths.userData_hooks}/fd.iconregistry`)) fs.mkdirSync(`${paths.userData_hooks}/fd.iconregistry`);
    console.log("TEST ADD ICON", icon.img, path.resolve(packageExtractionPath, icon.img))
    fs.copyFileSync(path.resolve(packageExtractionPath, icon.img), `${paths.userData_hooks}/fd.iconregistry/${icon.identifier}.${icon.img.split(".").at(-1)}`)
    debug.log(picocolors.green(`Added icon ${icon.identifier}.`), "Icon Registry")
  }
}

module.exports = iconRegistry;