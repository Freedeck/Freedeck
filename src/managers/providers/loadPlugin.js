const path = require("node:path");
const picocolors = require("$/picocolors");
const fs = require("node:fs");
const debug = require('$/debug');

function writeAndLock(k, v, i) {
  k[v] = i;
  Object.defineProperty(k, v, {
    writable: false,
    configurable: false
  })
}

module.exports = async (entry, filePath, freedeck, expected, pluginManager, pathToEx) => {
  if (freedeck.icons) {
    const iconEntryPath = path.resolve(pathToEx, freedeck.icons);
    const iconEntry = require(iconEntryPath);
    try {
      iconEntry(pathToEx);
    } catch (err) {
      console.error(err);
    }
  }
  try {
    entry.class._usesAsar = false;
    const instantiated = entry.exec();
    for (const k of Object.keys(expected)) {
      writeAndLock(instantiated, k, expected[k]);
    }
    instantiated.disabled = freedeck.disabled;
    instantiated.file = { filePath };
    Object.freeze(instantiated.file);
    instantiated._fd_dropin();
    pluginManager.plugins().set(instantiated.id, { instance: instantiated });
    if (instantiated.disabled) {
      pluginManager._disabled.push(filePath);
      return;
    }
    if (
      fs.existsSync(
        path.resolve(`./plugins/${instantiated.id}/settings.json`),
      )
    ) {
      const settings = JSON.parse(
        await fs.promises.readFile(
          path.resolve(`./plugins/${instantiated.id}/settings.json`),
        ),
      );
      pluginManager._settings.set(instantiated.id, settings);
    }
    debug.log(
      picocolors.green(
        `Plugin loaded: ${instantiated.name} (${instantiated.id})`,
      ),
      "Plugins / Loader",
    );
  } catch (er) {
    console.error(
      `${picocolors.blue("Plugins / Loader")} >> ${picocolors.red(`Error loading ${filePath}: ${er.toString()}`)}`,
    );
  }
}