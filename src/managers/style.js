const fs = require("node:fs");
const path = require("node:path");
const debug = require("$/debug")
const styleLocation = path.resolve("./src/configs/style.json");

const defaults = {
  scroll: false,
  fill: false,
  center: false,
  animation: false,
  compact: true,
  "font-size": "15",
  buttonSize: "6",
  iconCountPerPage: "12",
  longPressTime: "3",
  tileCols: "5",
};

const styleManager = {
  _cache: {},
  get: () => {
    if (Object.keys(styleManager._cache).length === 0) {
      styleManager.update();
      debug.log("Style updated.", "Style Cache");
    }
    return styleManager._cache;
  },
  default: () => {
    if (!fs.existsSync(styleLocation)) {
      const def = JSON.stringify(defaults);
      fs.writeFileSync(styleLocation, def);
      debug.log(
        "Created default style configuration file.",
        "Style / Migration"
      );
    }
  },
  update: () => {
    styleManager.default();
    delete require.cache[require.resolve(styleLocation)];
    styleManager._cache = require(styleLocation);
    debug.log("Settings recached.", "Settings Cache");
  },
  save: () => {
    fs.writeFileSync(styleLocation, JSON.stringify(styleManager.get()));
    debug.log("Loaded style configuration from file.", "Style / Migration");
  }
}

module.exports = styleManager;