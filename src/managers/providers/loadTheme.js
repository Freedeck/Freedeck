const path = require("node:path");
const picocolors = require("$/picocolors");
const debug = require("$/debug");
const fs = require("node:fs");

function writeAndLock(k, v, i) {
  k[v] = i;
  Object.defineProperty(k, v, {
    writable: false,
    configurable: false
  })
}

module.exports = async (filePath, pkg, pluginManager, pathToEx) => {
  const { main, name, description, author, version, freedeck } = pkg;
  const location = path.resolve(`user-data/themes/${name}`);
  const themeFile = path.resolve(`user-data/themes/${name}.css`);
  if (!fs.existsSync(location)) {
    await fs.promises.mkdir(location, { recursive: true });
  }
  const noop = (...e) => { };
  const instantiated = {};
  writeAndLock(instantiated, 'id', name)
  writeAndLock(instantiated, 'packageType', 'theme')
  writeAndLock(instantiated, 'name', freedeck.title + ' (Theme)')
  writeAndLock(instantiated, 'author', author)
  writeAndLock(instantiated, 'v2', true)
  instantiated._intent = [];
  instantiated.emit = noop;
  instantiated.on = noop;
  instantiated.hooks = [];
  instantiated.types = [];
  instantiated.views = {};
  instantiated.file = { filePath };
  Object.freeze(instantiated.file);
  instantiated.version = version;
  instantiated.disabled = freedeck.disabled;
  pluginManager.plugins().set(instantiated.id, { instance: instantiated });
  if (freedeck.files) {
    for (const file of freedeck.files) {
      if (!fs.existsSync(path.resolve(pathToEx, file))) {
        console.error(
          `${picocolors.blue("Plugins / Theme Loader")} >> ${picocolors.red(`Error adding theme file: ${file} does not exist.`)}`,
        );
        continue;
      }
      const dest = path.resolve(location, file);
      await fs.promises.copyFile(path.resolve(pathToEx, file), dest);
    }
  }
  const themeMeta = `:theme-meta {
      --name: "${freedeck.title}";
      --description: "${description}";
      --author: "${author}";
      --version: "${version}";
      }\n`;
  await fs.promises.appendFile(themeFile, themeMeta);

  await fs.promises.appendFile(
    themeFile,
    await fs.promises.readFile(path.resolve(pathToEx, main)),
  );
  debug.log(
    picocolors.green(
      `Theme loaded: ${instantiated.name} (${instantiated.id})`,
    ),
    "Plugins / Theme Loader",
  );
}