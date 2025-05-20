const path = require('node:path');
const tar = require('tar');
const picocolors = require("$/picocolors");
const fs = require('node:fs');

async function openPackage({debug, filePath, pluginManager, overrideExtractionPath}) {
  const resolved = path.resolve(`./plugins/${filePath}`);
  let pathToEx = path.resolve(`./tmp/_${filePath.replaceAll("/", "_")}`);
  if(!overrideExtractionPath) {
    if(fs.existsSync(pathToEx)) fs.rmSync(pathToEx, {recursive:true,force:true})
    fs.mkdirSync(pathToEx, { recursive: true });
    tar.x({
      file: resolved,
      cwd: pathToEx,
      sync: true
    });
  } else {
    pathToEx = overrideExtractionPath;
  }
  const cfgPath = path.resolve(pathToEx, "package.json");
  const { main, name, description, author, version, freedeck } = require(cfgPath);
  if(!freedeck) {
    console.error(`${picocolors.blue("Plugins / FDPackage")} >> ${picocolors.red(`Error: ${filePath} does not contain a Freedeck package definition.`)}`);
    return;
  }
  if(freedeck.disabled && freedeck.disabled === "true") {
    console.log(`${picocolors.blue("Plugins / FDPackage")} >> ${picocolors.gray(`Plugin ${freedeck.title} is disabled. Skipping.`)}`);
    return;
  }
  if(freedeck.package !== 'plugin' && freedeck.package !== 'theme') {
    console.error(`${picocolors.blue("Plugins / FDPackage")} >> ${picocolors.red(`Error: ${freedeck.title} does not contain a valid Freedeck package type.`)}`);
    return;
  }
  if(freedeck.package === 'plugin') {
    const entryPath = path.resolve(pathToEx, main);
    const entry = require(entryPath);
    try {
      entry.class._usesAsar = false;
      const instantiated = entry.exec();
      instantiated.id = name;
      instantiated.name = freedeck.title;
      instantiated.author = author;
      instantiated.version = version;
      instantiated.disabled = freedeck.disabled;
      instantiated.file = {filePath};
      Object.freeze(instantiated.file);
      instantiated._fd_dropin();
      debug.log("FD DropIn hit. (Post constructor, pre-init)", "Plugins / " + instantiated.name);
      pluginManager._plc.set(instantiated.id, { instance: instantiated });
      if (instantiated.disabled) {
        pluginManager._disabled.push(filePath);
        return;
      }
      if (fs.existsSync(path.resolve(`./plugins/${instantiated.id}/settings.json`))) {
        const settings = JSON.parse(
          fs.readFileSync(
            path.resolve(`./plugins/${instantiated.id}/settings.json`),
          ),
        );
        pluginManager._settings.set(instantiated.id, settings);
      }
    } catch(er) {
      console.error(`${picocolors.blue("Plugins / FDPackage")} >> ${picocolors.red(`Error loading ${filePath}: ${er.toString()}`)}`);
    }
  } else if(freedeck.package === 'theme') {
    const location = path.resolve(`user-data/themes/${name}`);
    const themeFile = path.resolve(`user-data/themes/${name}.css`);
    if(!fs.existsSync()) {
      fs.mkdirSync(location, { recursive: true });
    }
    if(freedeck.files) {
      for(const file of freedeck.files) {
        if(!fs.existsSync(path.resolve(pathToEx, file))) {
          console.error(`${picocolors.blue("Plugins / FDPackage")} >> ${picocolors.red(`Error adding theme file: ${file} does not exist.`)}`);
          continue;
        }
        const dest = path.resolve(location, file);
        fs.copyFileSync(path.resolve(pathToEx, file), dest);
      }
    }
    const themeMeta = `:theme-meta {
      --name: "${freedeck.title}";
      --description: "${description}";
      --author: "${author}";
      --version: "${version}";
      }\n`;  
    fs.appendFileSync(themeFile, themeMeta);

    fs.appendFileSync(themeFile, fs.readFileSync(path.resolve(pathToEx, main)));
  }
  debug.log(`${picocolors.green(`${freedeck.package === 'plugin' ? "Plugin" : "Theme"} loaded: ${freedeck.title} (${name})`)}`, picocolors.blue("Plugins / FDPackage"));
}


module.exports = openPackage