const path = require("node:path");
const NotificationManager = require("@managers/notifications.js");
const pluginManager = require("@managers/plugins.js");
const fs = require("node:fs");
const HookRef = require("./HookRef");

const picocolors = require("$/picocolors");
const debug = require("$/debug");

const pluginsLocation = path.resolve("./plugins");

class Plugin {  
  v2 = true;
  name;
  author;
  imports = [];
  Settings = {};
  hooks = [];
  views = {};
  id;
  disabled = false;
  stopped = false;
  hasInit = false;
  popout = "";
  _hookLocation = "user-data/hooks/";
  _usesAsar = false;
  _customLog(...msg) {
    debug.log(msg.join(" "), picocolors.blue(`Plugins / ${this.id || "Class"}`));
  }
  _id = Math.random().toString(36).substring(7);
  _callbacks = {};
  _intent = [];

  io = {
    active: false,
    emit:()=>{},
  }
  
  constructor() {
    this.id = `app.freedeck.pdx${this._id}`;
    this.name = "Loading...";
    this.author = "Loading...";
    this.disabled = false;
    this.types = [];
    this._callbacks = {};
    this._intent = [];
  }

  /**
   * Set a popout to be shown
   * @param {string} popout HTML inline string
   */
  setPopout(popout) {
    this._customLog("Setting custom popout content.");
    this.popout = popout;
  }

  /**
   * Set popout data to hide the button
   */
  hidePopout() {
    this._customLog("Hiding popout.");
    this.popout = "";
  }

  /**
   * Set the plugin's name
   * @param {string} name Plugin name
   */
  setName(name) {
    this._customLog("Set plugin name.");
    this.name = name;
  }
  /**
   * Set the plugin's author
   * @param {string} name Plugin author
   */
  setAuthor(author) {
    this._customLog("Set plugin author.");
    this.author = author;
  }
  /**
   * Set the plugin's ID
   * @param {string} name Plugin ID
   */
  setID(id) {
    this._customLog("Set plugin ID.");
    this.id = id;
  }
  /**
   * Set the plugin's disabled
   * @param {string} name Plugin disabled
   */
  setDisabled(disabled) {
    this._customLog("Set plugin disabled.");
    this.disabled = disabled;
  }
  
  /**
   * Internal function used for backwards/forwards compatibility
   */
  _fd_dropin() {
    if (this.disabled) return;
    this.hasInit = this.onInitialize();
    if (!this.hasInit) {
      console.log("Plugin didn't initialize?");
    }
    this._customLog("Initialized plugin.");
    
    this.id = this.id.toLowerCase();
    this.setup();
    
    this._customLog("Called setup.");


    this.emit(events.ready);

    this._customLog("Emitted ready.");  
  }

  /**
   * Internal function used for backwards/forwards compatibility
   */
  onInitialize() {
    return true;
  }

  /**
   * Internal function used for backwards/forwards compatibility. Event is forwarded upwards for compatibility
   */
  onButton(e) {
    this._customLog("Forwarding press interaction from v1->v2");
    this.emit(events.button, {
      interaction: e,
      instance: this,
      io: this.io,
      socket: this.socket,
      clients: this.clients,
    });
  }

  /**
   * Internal function used for backwards/forwards compatibility. Event is forwarded upwards for compatibility
   */
  onStopping() {
    this._customLog("Forwarding stopping interaction from v1->v2");
    this.emit(events.stopping);
  }

  /**
   * This code will be ran once upon initialization
   */
  setup() {};

  /**
   * @deprecated Backwards/forwards compatability
   */
  exec() {};

  /**
   * Request an intent for usage of special private APIs.
   * This is just to tell the Freedeck server what you will be doing.
   * @param {number} intent The intent's ID. Can be gotten from 'api.js' object "intents"
   */
  requestIntent(intent) {
    if(!Object.values(intents).includes(intent)) return;
    if(this._intent.includes(intent)) return;
    this._customLog(`Intent requested: ${Object.keys(intents)[intent]}`);
    this._intent.push(intent);
  }

  /**
   * Register a callback to run when an ID gets emitted
   * @param {number} ev Event ID. Can be gotten from 'api.js' object "events"
   * @param {void} cb The callback you wish to supply to the event upon it's calling
   */
  on(ev, cb) {
    this._customLog(`Listening for ${Object.keys(events)[ev]} v2-event`);
    if(!this._callbacks[ev]) this._callbacks[ev] = [];
    this._callbacks[ev].push(cb);
  }

  /**
   * Emit an event, run all registered specific callbacks on this plugin
   * @param {number} ev Event ID. Can be gotten from 'api.js' object "events"
   * @param {any[]} args Any arguments you want the callback to be supplied with
   */
  emit(ev, ...args) {
    this._customLog(`Emitting ${Object.keys(events)[ev]} v2-event`);
    if(!this._callbacks[ev]) return;
    for(const cb of this._callbacks[ev]) {
      cb(...args);
    }
  }
  
  /**
   * Add a hook with the new HookRef system.
   * @param {HookRef} type 
   * @param {PathLike} file 
   */
  add(type, file) {
    this._customLog(`Adding ${Object.keys(HookRef.types)[type]} hook: ${file}`);
    switch(type) {
      case HookRef.types.client:
        this.setJSClientHook(file);
        break;
      case HookRef.types.server:
        this.setJSServerHook(file);
        break;
      case HookRef.types.socket:
        console.log("!!! Socket hooks are unsupported with the new system.");
        console.log("!!! This functionality has been built in to 'this.io' in your plugin!");
        console.log("!!! You need to request the intents: intents.IO, intents.SOCKET for the server & client.");
        console.log("!!! You need to request the intent: intents.CLIENTS for the clients.");
        break;
      case HookRef.types.view:
        this.addView(file, file);
        break;
      case HookRef.types.import:
        this.addImport(file);
        break;
    }
  }
  /**
   * @param {String} hook The JS file that will be loaded into the socket handler
   */
  setJSSocketHook(hook) {
    this.internalAdd(HookRef.types.socket, hook, `${this._hookLocation}_`);
  }

  /**
   * @param {String} hook The JS file that will be loaded into the browser
   */
  setJSServerHook(hook) {
    this.internalAdd(HookRef.types.server, hook, this._hookLocation);
  }

  /**
   * @param {String} hook The JS file that will be loaded into the browser
   */
   setJSClientHook(hook) {
    this.internalAdd(HookRef.types.client, hook, this._hookLocation);
  }

  addView(view, file) {
    const viewFolder = `${file}.view`;
    this.views[view] = viewFolder;
    const viewBase = "user-data/plugin-views/";
    if(!fs.existsSync(path.resolve(viewBase, this.id))) fs.mkdirSync(path.resolve(viewBase, this.id), {recursive: true});
    this.internalAdd(HookRef.types.view, viewFolder, path.resolve(viewBase, this.id));
  }

  /**
   Internal method for adding hookrefs
   @param {*} type the HookRef type
   @param {*} hook File path to hook
   @param {*} copyTo folder to copy hook to
   */
  internalAdd(type, hook, copyTo) {
    let foundPath = `tmp/_${this.id}.fdpackage`;
    if(this._usesAsar) foundPath = `tmp/_e_._plugins_${this.id}.Freedeck`;
    const hookPath = path.resolve(foundPath, hook);

    if (!fs.existsSync(hookPath)) {
      console.log(`Source file does not exist: ${hookPath}`);
      return;
    }

    this.hooks.push(new HookRef(hookPath, type, hook));

    const destination = path.resolve(copyTo, path.dirname(hook));

    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    
    const copyOpts = {force:true};
    copyOpts.recursive = (type === HookRef.types.view); 

    fs.cpSync(hookPath, path.resolve(destination, path.basename(hook)), copyOpts)
  }

  /**
   * @param {String} file The file you want to import
   */
  addImport(file) {
    this.imports.push(file);
    this.internalAdd(HookRef.types.import, file, this._hookLocation);
  }

  /**
   * @return {String} The JS file that will be loaded into the browser
   */
  getJSServerHook() {
    return this.hooks.filter((ref) => ref.type === HookRef.types.server);
  }

  /**
   * @return {String} The JS file that will be loaded into the browser
   */
  getJSClientHook() {
    return this.hooks.filter((ref) => ref.type === HookRef.types.client);
  }

  /**
   * Create save data folders/file structure for the plugin.
   */
  createSaveData() {
    if (!fs.existsSync(pluginsLocation)) {
      fs.mkdirSync(pluginsLocation);
      console.log("Failsafe created plugins folder!");
    }
    if (!fs.existsSync(path.resolve(`./plugins/${this.id}`))) {
      fs.mkdirSync(path.resolve(`./plugins/${this.id}`));
      console.log(`Created ${this.id} data folder!`);
    }
    if (!fs.existsSync(path.resolve(`./plugins/${this.id}/settings.json`))) {
      fs.writeFileSync(
        path.resolve(`./plugins/${this.id}/settings.json`),
        JSON.stringify({}),
      );
    }
  }

  _forceJsonObject(filePath) {
    let output = {};
    try {
      output = JSON.parse(fs.readFileSync(filePath))
    } catch(e) {
      console.log("*** ERROR WHILE READING JSON FROM", filePath, "***")
      console.error(e);
    }
    return output;
  }

  /**
   * Get from the save data.
   * @param {String} k The key to get from the save data
   * @return {*} The value from the save data
   */
  getFromSaveData(k) {
    this.createSaveData();
    const data = this._forceJsonObject(path.resolve(`./plugins/${this.id}/settings.json`));
    this.Settings[k] = data[k];
    return data[k];
  }

  /**
   * Add to the save data.
   * @param {String} k The key to set in the save data
   * @param {*} v The data to set in the save data
   */
  setToSaveData(k, v) {
    this.createSaveData();
    const data = this._forceJsonObject(path.resolve(`./plugins/${this.id}/settings.json`));
    data[k] = v;
    this.Settings[k] = v;
    fs.writeFileSync(
      path.resolve(`./plugins/${this.id}/settings.json`),
      JSON.stringify(data),
    );
  }

  /**
   * Add a notification to the queue.
   * @param {String} value The notification's content
   * @param {Object} options Extra options for the notification
   */
  pushNotification(value, options = null) {
    if (!options) NotificationManager.add(this.name, `<br>${value}`);
    if (options != null && Object.keys(options).length > 0) {
      if (options.image) {
        NotificationManager.add(
          this.name,
          `<br><img src='${options.image}' width='50' height='50'><br>${value}`,
        );
      }
    }
  }

  /**
   * Register a new type for Companion
   * @param {String} name The name of the button type
   * @param {String} type The identifier for the button type
   * @param {Object} templateData The data for the button type
   * @param {String} renderType The type of button to render
   */
  registerNewType(name, type, templateData = {}, renderType = "button") {
    return this.register({
      display: name,
      type,
      templateData,
      renderType,
    });
  }

  register(opt={display:"abc",type:"abc",templateData:{},renderType:types.button}) {
    if (!opt.display || !opt.type) return false;
    const basic = {
      type: opt.type,
      renderType: opt.renderType || types.button,
      templateData: opt.templateData || {},
    }
    const existingType = this.types.filter((e) => {e.type === basic.type});
    if(existingType.length > 0) {
      this.types = this.types.filter((e) => e !== existingType[0]);
    }
    this.types.push({
      ...basic,
      name: opt.display,
      pluginId: this.id,
      hidden: opt.hidden? opt.hidden : false,
      display: this.name,
    });
    return pluginManager
      .types()
      .set(opt.type, { instance: this, ...basic, display: opt.display });
  }

  /**
   * Remove a type from Companion
   * @param {String} type The identifier for the button type
   * @return {Boolean} If the type was removed successfully
   */
  deregisterType(type) {
    if (pluginManager.types().has(type)) {
      pluginManager.types().delete(type);
      this.types = this.types.filter((t) => t.type !== type);
      return true;
    }
    return false;
  }

  deregisterAllTypes() {
    for (const type of this.types) {
      this.deregisterType(type.type);
    }
  }

  /**
   * End the plugin.
   */
  stop() {
    this.onStopping();
    this.disabled = true;
    this.stopped = true;
  }

  /**
   * Check if the plugin is running in the development environment.
   * @return {Boolean} If the development environment is active
   */
  isDev() {
    return false;
  }
};

const types = {
  button: "button",
  slider: "slider",
  text: "text"
}

const events = {
  connection: 0,
  button: 1,
  ready: 2,
  stopping: 3,
  stopped: 4
}

const intents = {
  SOCKET: 0,
  IO: 1,
  CLIENTS: 2,
  HIDE: 3,
  hooks: {
    CLIENT: 0xd2,
    SERVER: 0xd3,
    SOCKET: 0xd4,
    IMPORT: 0xd5,
    VIEW: 0xd6
  }
}

module.exports = {
  Plugin,
  HookRef,
  events,
  intents,
  types
}