const fs = require("node:fs");
const path = require("node:path");

const picocolors = require("$/picocolors.js");
const debug = require("$/debug.js");

const configLocation = path.resolve("./src/configs/main.json");
const profilesFolder = path.resolve("./src/configs/profiles");
const styleLocation = path.resolve("./src/configs/style.json");

const sc = {
  configLocation,
  styleLocation,
  profilesFolder,
  _cache: {},
  settings: () => {
    if (Object.keys(sc._cache).length === 0) {
      sc.update();
      debug.log("Settings updated.", "Settings Cache");
    }
    return sc._cache;
  },
  styleSettings: {
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
  },
  checkStyle: async () => {
    try {
      if (!fs.existsSync(styleLocation)) {
        const def = JSON.stringify(sc.styleSettings);
        await fs.writeFile(styleLocation, def, (e) => {
          if (e) {
            debug.log(
              `Error creating style configuration: ${e}`,
              "Style / Migration"
            );
          }
        });
        debug.log("Created default style configuration file.", "Style / Migration");
      } else {
        const data = JSON.parse(
          await fs.readFile(styleLocation, (e) => {
            if (e) {
              debug.log(
                `Error reading style configuration: ${e}`,
                "Style / Migration"
              );
            }
          })
        );
        for (const key in sc.styleSettings) {
          if (!data[key] || typeof data[key] !== typeof sc.styleSettings[key]) {
            data[key] = sc.styleSettings[key];
            debug.log(
              `Added ${picocolors.yellow(key)} to style.json`,
              "Style / Migration"
            );
          }
        }
        await fs.writeFile(styleLocation, JSON.stringify(data), (e) => {
          if (e) {
            debug.log(
              `Error saving style configuration: ${e}`,
              "Style / Migration"
            );
          } else {
            debug.log("Saved style configuration.", "Style / Migration");
          }
        });
        debug.log("Loaded style configuration from file.", "Style / Migration");
      }
    } catch (err) {
      debug.log(`Error in checkStyle: ${err}`, "Style / Migration");
    }
  },
  update: async () => {
    await sc.checkStyle();
    delete require.cache[require.resolve(configLocation)];
    sc._cache = require(configLocation);
    sc._cache.profiles = {};
    for(const profile of fs.readdirSync(profilesFolder)) {
      const ptp = path.resolve(profilesFolder, profile);
      const thing = require.resolve(ptp);
      if(require.cache[thing]) {
        delete require.cache[thing];
      }
      const _data = require(ptp);
      sc._cache.profiles[profile.split(".json")[0]] = _data;
    }
    debug.log("Settings recached.", "Settings Cache");
  },
  internalSavers: {
    asyncSaveMainConfiguration: (thatConfig) => {
      (async () => {
        sc.internalSavers.saveMainConfiguration(thatConfig);
      })();
    },
    saveMainConfiguration: (thatConfig) => {
      const newMainConfig = {
        writeLogs: thatConfig.writeLogs || false,
        release: thatConfig.release || "stable",
        theme: thatConfig.theme || "default.css",
        profile: thatConfig.profile || "Default",
        screenSaverActivationTime: thatConfig.screenSaverActivationTime || 5,
        soundOnPress: thatConfig.soundOnPress || false,
        useAuthentication: thatConfig.useAuthentication || false,
        port: thatConfig.port || 5754
      };
      const cfgStr = JSON.stringify(newMainConfig);
      return fs.writeFile(configLocation, cfgStr, (e) => {
        if (e) {
          console.log(`Error saving settings: ${e}`);
        } else {
          debug.log("Settings saved.", "Settings Cache");
        }
      });
    },
    saveSpecificProfile: (profiles, profile) => {
      const data = profiles[profile];
      const profileFilename = profile.replaceAll(/[/\\?%*:|"<>]/g, "");
      fs.writeFile(path.resolve(profilesFolder, `${profileFilename}.json`), JSON.stringify(data), (e) => {
        if(e) {
          console.error("Error saving profile",profileFilename,e);
        } else {
          debug.log(`Saved profile ${profileFilename}`, "Settings Cache");
        }
      })
    },
    asyncSaveSpecificProfile: (profiles, profile) => {
      (async () => {
        sc.internalSavers.saveSpecificProfile(profiles, profile);
      })();
    }
  },
  save: () => {
    const thatConfig = sc.settings();
    
    for(const profile in thatConfig.profiles) {
      (async () => {
        sc.internalSavers.saveSpecificProfile(thatConfig.profiles, profile);
      })();
    }
    return sc.internalSavers.saveMainConfiguration(thatConfig);
  },
};

// https://stackoverflow.com/questions/6860853/generate-random-string-for-div-id
function generateID(len = 12) {
  const S4 = () => (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  return (`${S4()+S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`);
}

module.exports = sc;
