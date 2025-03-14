import Pako from "pako";
import { compareVersions } from "compare-versions";
import repositoryManager from "./lib/repositoryManager";
import dataHandler from "./init/data";
import eventsHandler from "./init/events";
import { UI } from "../client/scripts/ui";
import audioEngine from "./audioEngine";
import themeEngine from "./themeEngine";
import uiSounds from "./uiSounds";
import { doLocalization } from "./localization";

/**
 * Open the settings menu (on clients only)
 */
function settingsMenu() {
  if (universal.name === "Main") {
    document.querySelector(".settings-menu").style.display = "flex";
    document.querySelector("#keys").style.display = "none";
  }
}
function settingsMenuClose() {
  if (universal.name === "Main") {
    // document.querySelector("#keys").style.display = "grid";
    // document.querySelector(".settings-menu").style.display = "none";
    document.querySelector(".settings-menu").style.animationName = "pull-up";
    document.querySelector(".settings-menu").style.animationDuration = "0.45s";
    document.querySelector(".settings-menu").style.animationFillMode =
      "forwards";
    document.querySelector("#keys").style.animationName = "pull-down";
    document.querySelector("#keys").style.animationDuration = "0.5s";

    setTimeout(() => {
      document.querySelector(".settings-menu").style.display = "none";
      document.querySelector(".settings-menu").style.animationName =
        "pull-down";
      document.querySelector("#keys").style.display = "grid";
    }, 250);
  }
}
window.AppSM = settingsMenu;
window.AppSMClose = settingsMenuClose;

window._OldFetch = window.fetch;
window.fetch = async (url, options) => {
  url = `${universal.relay}${url}`;
  return window._OldFetch(url, options);
};

const universal = {
  compareVersions,
  relay: "",
  _socket: null,
  _ca: [],
  _Uploads_View: 0,
  lastRetry: -1,
  connected: false,
  reconnect: () => {
    universal.connected = false;
    universal.lastRetry = new Date();
    universal._socket.connect();
    universal._ca.push(universal.lastRetry);
  },
  wakeLock: {
    sentinel: null,
    request: async () => {
      if ("wakeLock" in navigator) {
        try {
          universal.wakeLock.sentinel = await navigator.wakeLock.request(
            "screen"
          );
          universal.CLU("Boot / WakeLock", "Wake lock acquired.");
        } catch (err) {
          console.error(`${err.name}, ${err.message}`);
          universal.sendToast("Failed to acquire wake lock.");
        }
      }
    },
  },
  lclCfg: () => universal._information.style || { compact: false },
  _information: {},
  _init: false,
  _authStatus: false,
  _tyc: new Map(),
  _serverRequiresAuth: true,
  page: 0,
  events: {},
  config: {},
  _loginAllowed: false,
  keys: document.querySelector("#keys")
    ? document.querySelector("#keys")
    : document.createElement("div"),
  notibar: document.querySelector("#snackbar")
    ? document.querySelector("#snackbar")
    : document.createElement("div"),
  save: (k, v) => {
    return localStorage.setItem(universal.storage.prefix(k), v);
  },
  load: (k) => {
    if (localStorage.getItem(btoa(`fd.${k}`))) {
      const i = localStorage.getItem(btoa(`fd.${k}`));
      localStorage.removeItem(btoa(`fd.${k}`));
      universal.CLU("Storage", `Migrated ${k} to new storage format.`);
      universal.save(k, atob(i));
    }
    const exists = localStorage.getItem(universal.storage.prefix(k));
    return exists ? exists : null;
  },
  remove: (k) => {
    return localStorage.removeItem(universal.storage.prefix(k));
  },
  exists: (k) => {
    return localStorage.getItem(universal.storage.prefix(k)) != null;
  },
  default: (k, v) => {
    universal.CLU("Default", `Setting ${k} to ${v}`);
    return universal.exists(k) ? universal.load(k) : universal.save(k, v);
  },
  loadObj: (k, d = {}) => {
    try {
      return JSON.parse(universal.load(k)) || d;
    } catch (e) {
      console.error("Error while loading object", k, e);
      return d;
    }
  },
  saveObj: (k, v) => {
    return universal.save(k, JSON.stringify(v));
  },
  flags: {
    _cache: {},
    reload: () => {
      universal.flags._cache = universal.loadObj("flags") || {};
    },
    isEnabled: (flag) => {
      return universal.flags._cache[flag] === "true";
    },
    set: (flag, value) => {
      universal.flags._cache[flag] = value;
      universal.save("flags", JSON.stringify(universal.flags._cache));
    },
    toggle: (flag) => {
      universal.flags._cache[flag] =
        universal.flags._cache[flag] === "true" ? "false" : "true";
      universal.save("flags", JSON.stringify(universal.flags._cache));
    },
  },
  storage: {
    prefix: (k) => `freedeck:${k}`,
    keys: () => {
      const _keys = [];
      for (const key of Object.keys(localStorage)) {
        _keys.push(key);
      }
      return _keys;
    },
    reset: () => {
      for (const key of Object.keys(localStorage)) {
        localStorage.removeItem(key);
        location.reload();
      }
    },
  },
  waitForElement: (selector, callback) => {
    const elem = document.querySelector(selector);
    if (elem) {
      callback(elem);
    } else {
      const observer = new MutationObserver((mutations) => {
        if (document.querySelector(selector)) {
          observer.disconnect();
          callback(document.querySelector(selector));
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  },
  showSpinner: (e = document.body) => {
    const elem = document.createElement("div");
    elem.className = "spinner";
    e.appendChild(elem);
  },
  updatePlaying: () => {
    if (document.querySelector(".now-playing")) {
      const fixed = [];
      for (const itm of universal.audioClient._nowPlaying) {
        fixed.push(itm.getAttribute("data-name"));
      }
      document.querySelector(".now-playing").innerText = fixed;
    }
  },
  embedded_settings: {
    createSelect: async (
      label,
      name,
      optionsPromise,
      labelsPromise,
      selected,
      eventHandler = () => {}
    ) => {
      const container = document.createElement("div");
      container.className = "es-setting";

      const select = document.createElement("select");
      select.id = name;

      const lbl = document.createElement("label");
      lbl.innerText = label;
      lbl.htmlFor = name;
      container.appendChild(lbl);
      container.appendChild(select);
      // Assuming optionsPromise is a Promise that resolves to an array of options
      const options = await optionsPromise;
      const labels = await labelsPromise;
      for (const option of options) {
        const opt = document.createElement("option");
        opt.value = option;
        opt.innerText = labels[options.indexOf(option)];
        if (option === selected) opt.selected = true;
        select.appendChild(opt);
      }
      // select the first option if none are selected
      if (select.selectedIndex === -1) select.selectedIndex = 0;
      select.onchange = (ev) => {
        universal.uiSounds.playSound("step_2");
        eventHandler(ev);
      };
      return container;
    },
  },
  audioClient: audioEngine,
  login: (passwd) => {
    universal.send(universal.events.login.login_data, {
      tlid: universal._information.tempLoginID,
    });
    universal.send(universal.events.login.login, { passwd });
  },
  theming: themeEngine,
  themes: [] /* Theme list */,
  imported_scripts: [],
  import: (script) => {
    universal.imported_scripts.push(script);
    const scriptElement = document.createElement("script");
    scriptElement.src = script;
    scriptElement.id = script.split("/").pop().split(".").shift();
    document.body.appendChild(scriptElement);
  },
  ExportReportData: () => {
    const erdStart = Date.now();
    console.log("<h2>Exporting..</h2>");
    console.log("<h3>Decoding Notification Log</h3>");
    const decodedNotifLog = universal.loadObj("logs/notif");
    console.log(
      "<p>The notification log can get large, so this may take some time.</p>"
    );
    console.log(`<p>Your log is ${decodedNotifLog.length} items long.</p>`);
    console.log("<h3>Decoded Notification Log.</h3>");
    console.log("<p>Now, we're putting it all together.</p>");
    const state = {};
    Object.assign(state, universal);
    state._socket = `C=${universal._socket.connected},U=${universal._socket.io.uri}`;
    state.keys = "DOM element";
    const erd = {
      erdStart,
      time: Date.now(),
      page: window.location.pathname,
      state,
      ls: {
        keys: universal.storage.keys(),
        ls: localStorage,
      },
      client_nlog: decodedNotifLog,
      client_cfg: universal.lclCfg(),
      errLog: universal.ErrorLog,
      client_bootlog: universal.CLUL,
    };
    const erdEnd = Date.now();
    erd.erdEnd = erdEnd;
    erd.exportTimeElapsed = erdEnd - erdStart;
    return JSON.stringify(erd);
  },
  CL: true,
  CLUL: [["Page loaded", Date.now()]],
  showBootLog: UI.showBootLog,
  CLU: (s, ...m) => {
    universal.CL ? console.log(`${s}:`, ...m) : null;
    const elem = document.createElement("code");
    elem.innerText = `${s}: ${m}\n`;
    universal.CLUL.push([elem.innerText, Date.now()]);
    document.querySelector("#boot-log").appendChild(elem);
  },
  doInitialize: (fn, systemData, ...args) => {
    try {
      universal.CLU(
        `Systems/${systemData.name}`,
        `Initializing ${systemData.name}...`
      );
      fn(...args);
      universal.CLU(
        `Systems/${systemData.name}`,
        `Initialized ${systemData.name}!`
      );
    } catch (e) {
      universal.CLU(
        `Systems/${systemData.name}`,
        `Error while initializing system: ${e}`
      );
    }
  },
  init: (user) =>
    new Promise((resolve, reject) => {
      fetch("/connect/webpack")
        .then((res) => res.json())
        .then((data) => {
          if (data.compiled !== 1) {
            window.location.href = `/new-connect.html?id=${user}`;
          }
        });
      UI.makeBootLog();
      doLocalization();
      universal.CLU("Boot", "(PRE LOG CREATION) Init promise created");
      universal.CLU("Boot", "Boot log created");
      universal.CLU("Boot", "Attempting to run LS migrations");
      try {
        universal.CLU("Boot", "Pre-init");
        universal._initFn(user).then(async () => {
          universal.CLU(
            "Boot",
            `Received full configuration (${
              Object.keys(universal.config).length
            } objects translated from ${
              Object.keys(universal._information).length
            })`
          );
          universal.CLU("Boot", "Running post-init tasks");
          universal.doInitialize(
            universal.theming.initialize,
            { name: "Theme Engine" },
            universal
          );
          universal.doInitialize(UI.initialize, { name: "UI" }, universal);
          universal.doInitialize(
            universal.audioClient.initialize,
            { name: "Audio Engine" },
            universal
          );
          universal.doInitialize(
            universal.uiSounds.initialize,
            { name: "UI Sounds" },
            universal
          );
          universal.CLU("Boot", "Post-init tasks completed.");
          universal.CLU("Boot", "Attempting to run localization.");
          universal.sendEvent("launch");
          UI.closeBootLog().then(() => {
            universal.CLU("Boot", "Boot log closed.");
            doLocalization();
            resolve(true);
          });
        });
      } catch (e) {
        console.error(`${e} | Universal: initialize failed.`);
        reject(e);
      }
    }),
  /* repos */
  repositoryManager,
  uiSounds,
  /*  */
  _cb: [],
  keySet: () => {
    let isCentered = false;
    if (universal.lclCfg() != null) isCentered = universal.lclCfg().center;
    universal.keys.innerHTML = "";
    for (let i = 0; i < universal.config.iconCountPerPage; i++) {
      const tempDiv = document.createElement("div");
      tempDiv.className = `button k-${i} unset k ${
        isCentered ? "tiles-center" : ""
      }`;
      universal.keys.appendChild(tempDiv);
    }

    let builtInKeys = [
      {
        name: "Stop All",
        onclick: (ev) => {
          universal.send(universal.events.keypress, {
            builtIn: true,
            data: "stop-all",
          });
        },
      },
      {
        name: "Reload",
        onclick: (ev) => {
          window.location.reload();
        },
      },
      {
        name: "Settings",
        onclick: (ev) => {
          window.AppSM();
        },
        handlers: ["onmousedown"],
        onmousedown: UI.quickActions,
      },
    ];

    if (universal.load("nopreset") === "true") builtInKeys = [];

    for (const key of builtInKeys) {
      const tempDiv = document.createElement("div");
      const cn = `button builtin k ${isCentered ? "tiles-center" : ""}`;
      tempDiv.innerText = key.name;
      tempDiv.onclick = key.onclick;
      if (key.name === "Settings") {
        tempDiv.innerText = "";
        tempDiv.id = "fd-settings-button";
        tempDiv.style.backgroundImage = "url(/common/icons/fd.png)";
        tempDiv.style.border = "none";
        tempDiv.style.backgroundColor = "transparent";
        tempDiv.style.boxShadow = "none";
      }
      if (key.handlers) {
        for (const h of key.handlers) {
          tempDiv[h] = key[h];
        }
      }
      tempDiv.className = cn;
      universal.keys.appendChild(tempDiv);
    }
  },
  connHelpWizard() {
    return new Promise((resolve, reject) => {
      universal.listenFor("finish_conn", resolve);
      universal.vopen("prompts");
    });
  },
  Pages: {},
  reloadProfile: () => {
    universal.app_sounds = universal.config.profiles[universal.config.profile];
    for (
      let i = 0;
      i < universal.app_sounds.length / universal.config.iconCountPerPage;
      i++
    ) {
      universal.Pages[i] = true;
    }
  },
  listenFor: (ev, cb) => {
    universal._cb.push([ev, cb]);
  },
  listenForOnce: (ev, cb) => {
    const fn = (...args) => {
      cb(...args);
      universal._cb = universal._cb.filter((c) => c[0] !== ev);
    };
    universal._cb.push([ev, fn]);
  },
  sendEvent: (ev, ...data) => {
    for (const cb of universal._cb) {
      if (cb[0] === ev) cb[1](...data);
    }
  },
  /**
   * Decompresses a Gzip blob
   * @param {*} blob A Gzip-compressed blob
   * @param {*} callback A callback function
   */
  decompressGzipBlob(blob, callback) {
    const data = Pako.inflate(new Uint8Array(blob), { to: "string" });
    callback(null, data);
  },
  /**
   * Async version of decompressGzipBlob
   * @param {*} blob Gzip-compressed blob
   * @return {Promise<string>} The decompressed data
   */
  asyncDecompressGzipBlob(blob) {
    return new Promise((resolve, reject) => {
      universal.decompressGzipBlob(blob, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  },
  name: "",
  _initFn: (/** @type {string} */ user) =>
    new Promise((resolve, reject) => {
      try {
        universal.CLU("InitFN", "Starting init function");
        window.universal = universal;
        universal.CLU("InitFN", "Copied universal to window");
        universal._socket = io();
        universal.CLU("InitFN", "Preflight: connection to socket");
        universal._socket.on("connect", () => {
          universal.CLU("InitFN", "We're connected to the server!");
          universal.connected = true;
          universal.name = user;
          if (universal.lastRetry !== -1) {
            universal.CLU("InitFN", "This is a reconnection.");
            universal.sendToast("Reconnected to server.");
            // tell server we're disconnecting
            universal._socket.disconnect();
            window.location.reload();
            return;
          }
          universal.CLU("InitFN", "Starting dataHandler");
          dataHandler(universal, user).then(() => {
            universal.CLU("InitFN", "Starting eventsHandler");
            eventsHandler(universal, user).then(() => {
              resolve(true);
            });
          });
        });
        universal.CLU("InitFN / WakeLock", "Attempting to grab wake lock.");
        universal.wakeLock.request();
        universal.CLU("InitFN", "Boot completed.");
      } catch (e) {
        console.error(e);
        reject(e);
      }
    }),
  sendToast: (message, sender = "") => {
    if (!HTMLElement.prototype.setHTML) {
      HTMLElement.prototype.setHTML = function (html) {
        this.innerHTML = universal.cleanHTML(html);
      };
    }
    if (!document.querySelector("#snackbar")) {
      const snackbar = document.createElement("div");
      snackbar.id = "snackbar";
      document.body.appendChild(snackbar);
    }
    const s = document.createElement("div");
    s.setHTML(`<h3>${sender}</h3>${message}`);
    s.classList.add("toast");
    s.classList.add("show");
    s.onclick = () => {
      s.className = s.className.replace("show", "");
      s.remove();
    };
    universal.uiSounds.playSound("notification");
    document.querySelector("#snackbar").appendChild(s);

    setTimeout(() => {
      s.className = s.className.replace("show", "hide");
      setTimeout(() => {
        s.remove();
      }, 500);
    }, 3000);
    const logIn = {
      timestamp: new Date(),
      page: window.location.pathname,
      message,
    };
    if (
      universal.loadObj("logs/notif").length > 0 &&
      !universal.flags.isEnabled("notification-log")
    )
      universal.saveObj("logs/notif", []);
    else {
      if (universal.loadObj("logs/notif").length > 128)
        universal.saveObj("logs/notif", []);
      if (universal.flags.isEnabled("notification-log")) {
        const log = universal.loadObj("logs/notif");
        log.push(logIn);
        universal.saveObj("logs/notif", log);
      }
    }
  },
  send: (event, value) => {
    universal._socket.emit(event, value);
  },
  on: (event, callback) => {
    universal._socket.on(event, callback);
  },
  once: (event, callback) => {
    universal._socket.once(event, callback);
  },
  log: (data, sender = "Universal") => {
    universal.send(universal.events.default.log, { sender, data });
    console.log(`[${sender}] ${data}`);
  },
  ErrorLog: [],
  createTooltipFor: (element, html) => {
    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.innerHTML = html;
    document.body.appendChild(tooltip);
    element.onmouseleave = () => {
      tooltip.classList.remove("show");
    };

    element.onmouseenter = () => {
      tooltip.classList.add("show");
    };
    element.onmousemove = (ev) => {
      tooltip.style.top = `${ev.clientY}px`;
      tooltip.style.left = `${ev.clientX}px`;
    };
    return tooltip;
  },
  /**
   * Sanitize an HTML string
   * (c) Chris Ferdinandi, MIT License, https://gomakethings.com
   * @param  {String}          str   The HTML string to sanitize
   * @param  {Boolean}         nodes If true, returns HTML nodes instead of a string
   * @return {String|NodeList}       The sanitized string or nodes
   */
  cleanHTML(str, nodes) {
    /**
     * Convert the string to an HTML document
     * @return {Node} An HTML document
     */
    function stringToHTML() {
      const parser = new DOMParser();
      const doc = parser.parseFromString(str, "text/html");
      return doc.body || document.createElement("body");
    }

    /**
     * Remove <script> elements
     * @param  {Node} html The HTML
     */
    function removeScripts(html) {
      const scripts = html.querySelectorAll("script");
      for (const script of scripts) {
        script.remove();
      }
    }

    /**
     * Check if the attribute is potentially dangerous
     * @param  {String}  name  The attribute name
     * @param  {String}  value The attribute value
     * @return {Boolean}       If true, the attribute is potentially dangerous
     */
    function isPossiblyDangerous(name, value) {
      const val = value.replace(/\s+/g, "").toLowerCase();
      if (["src", "href", "xlink:href"].includes(name)) {
        if (val.includes("javascript:") || val.includes("data:")) return true;
      }
      if (name.startsWith("on")) return true;
    }

    /**
     * Remove potentially dangerous attributes from an element
     * @param  {Node} elem The element
     */
    function removeAttributes(elem) {
      // Loop through each attribute
      // If it's dangerous, remove it
      const atts = elem.attributes;
      for (const { name, value } of atts) {
        if (!isPossiblyDangerous(name, value)) continue;
        elem.removeAttribute(name);
      }
    }

    /**
     * Remove dangerous stuff from the HTML document's nodes
     * @param  {Node} html The HTML document
     */
    function clean(html) {
      const nodes = html.children;
      for (const node of nodes) {
        removeAttributes(node);
        clean(node);
      }
    }

    // Convert the string to HTML
    const html = stringToHTML();

    // Sanitize it
    removeScripts(html);
    clean(html);

    // If the user wants HTML nodes back, return them
    // Otherwise, pass a sanitized string back
    return nodes ? html.childNodes : html.innerHTML;
  },
};

export { universal };
window.universal = universal;
window.onerror = (message, source, lineno, colno, error) => {
  document.querySelector("#keys").style.display = "none";
  let modal = document.createElement("dialog");
  if (!document.querySelector("#error-dialog")) {
    modal.id = "error-dialog";
    modal.classList.add("modal");
    const content = document.createElement("div");
    content.innerHTML = `
    <h1>Freedeck</h1>
    <p>
      Freedeck has encountered an error. This does not crash the app, but may cause unexpected behavior.
    </p>
		<small>Handler: universal</small>
    <details open>
      <summary>Error Details</summary>
      <small>
        ${message} in ${source} at line ${lineno}:${colno}
      </small>
    </details>
    <br>
    <div class='flex-wrap-r'>
    <a style='display:block;width:100%;font-size:1.5em;text-align:center;' href='javascript:window.ErrorIgnore();'>Ignore</a>
    <a style='display:block;width:100%;font-size:1.5em;text-align:center;' href='javascript:window.location.reload();'>Reload</a>
    </div>
    <small>Ignoring the error may cause Freedeck to be unusable.</small>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);
    modal.showModal();
  } else modal = document.querySelector("#error-dialog");

  console.log(message, source, lineno, colno, error);
};

window.ErrorIgnore = () => {
  document.querySelector("#error-dialog").remove();
  document.querySelector("#keys").style.display = "grid";
  if (window.location.href.includes("companion")) {
    document.querySelector(".sidebar").style.display = "flex";
  }
};
if (!universal.UI) universal.UI = UI;

universal.listenFor(
  "animate_page",
  (type = "automated", direction = "left") => {
    if (universal.lclCfg().animation !== true) return;
    const keys = document.getElementById("keys");
    if (type === "automated") {
      keys.style.animation = `pull-${direction} 0.5s`;
    }
  }
);