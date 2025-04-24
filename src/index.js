require('module-alias/register');

const picocolors = require("$/picocolors");
const fs = require("node:fs");
const path = require("node:path");

const {configLocation} = require("@managers/settings");
const legacyConfigurationLocation = path.resolve("src/configs/config.fd.js")

const runCfg = {
  runs: {
    server: !hasArgument("--companion-only"),
    companion: !hasArgument("--server-only"),
    setup: hasArgument("--setup")
  },

  requirements: {
    settingsExists: fs.existsSync(legacyConfigurationLocation) || fs.existsSync(configLocation)
  }
}

function hasArgument(i) { return process.argv.includes(i)};

const shouldExitNoSettings = (!runCfg.requirements.settingsExists && runCfg.runs.server);

if(shouldExitNoSettings || runCfg.runs.setup) {
  console.log(picocolors.bgRed("Settings do not exist yet."));
  process.exit(0);
}

if (runCfg.runs.companion === false) {
  console.log(picocolors.blue("Server only mode."));
  require("./migration");
  require('$/console.js');
  createInterruptHandlers();
  (async()=>require("./server"))();
} else if (runCfg.runs.server === false) {
  console.log(picocolors.blue("Companion only mode."));
  const { app } = require("electron");
  app.on("ready", () => {
    require("./app/makeWindow")("webui/client/new-connect.html", true, 420, 525, false);
  })
}

/**
 * Setup the terminal
*/
function createInterruptHandlers() {
  const signals = [
    "SIGHUP",
    "SIGINT",
    "SIGQUIT",
    "SIGILL",
    "SIGTRAP",
    "SIGABRT",
    "SIGBUS",
    "SIGFPE",
    "SIGUSR1",
    "SIGSEGV",
    "SIGUSR2",
    "SIGTERM",
    "exit",
  ];

  for (const sig of signals) {
    process.on(sig, () => {
      if (sig === "SIGINT") console.log(`${picocolors.blue("Freedeck")} >> ${picocolors.red('Shutting down...')}`);
      terminator(sig);
    });
  }

  const terminator = (sig) => {
    // call your async task here and then call process.exit() after async task is done
    const hookPath = path.resolve("./user-data/hooks");
    if (fs.existsSync(hookPath)) {
      for (const file of fs.readdirSync(hookPath)) {
        fs.rmSync(path.resolve(hookPath, file), {
          recursive: true,
        });
        console.log(`${picocolors.blue("Freedeck")} >> ${picocolors.red(`Unloaded hook ${file}`)}`);
      }

      console.log(`${picocolors.blue("Freedeck")} >> ${picocolors.red("Unloaded all hooks")}`);
    }
    if (fs.existsSync(path.resolve("./tmp"))) {
      fs.rm(path.resolve("./tmp"), { recursive: true }, (e) => {
        if(e) {
          console.error("Error removing plugin extractions", e);
        } else console.log(`${picocolors.blue("Freedeck")} >> ${picocolors.red("Unloaded plugin extractions")}`);
      });
    }

    setTimeout(() => {
      console.log(`${picocolors.blue("Freedeck")} >> ${picocolors.red("Exiting...")}`);
      process.exit(1);
    });
  };
}