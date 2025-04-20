import { UI } from "../../client/scripts/ui";
import { generic, handler } from "../nativeHandler";
import loadRightSidebar from "../../companion/scripts/sidebar/sections/SidebarLoader.js";
import Pako from "pako";

export default async function dataHandler(universal, user) {
  universal.CLU("Incoming Data Handler", "Taking over for now.");
  universal.on(0x01, (reason) => {
    universal.CLU("Incoming Data Handler", `Connection failed. Retrying. Reason: ${reason}`);
    universal.send(0x00, user);
  })
  universal.CLU(
    "Incoming Data Handler",
    "Created promise, listening for Identify event.",
  );
  universal.ui = UI;
  universal.on("I", async (gzipped) => {
    universal.CLU("Incoming Data Handler", "Caught Identify event.");
    universal.connected = true;
    window.universal = universal;
    universal.CLU("Incoming Data Handler", "Re-copied Universal to window.");

    const data = await universal.asyncDecompressGzipBlob(gzipped);
    universal.CLU("Incoming Data Handler", "Decompressed data.");
    const parsed = JSON.parse(data);
    universal.CLU("Incoming Data Handler", "Parsed data.");
    universal._information = JSON.parse(data);
    universal.CLU("Incoming Data Handler:Setup", "Set raw server info");
    universal.events = parsed.events;
    universal.CLU("Incoming Data Handler:Setup", "Set events");
    universal.config = parsed.config;
    universal.CLU("Incoming Data Handler:Setup", "Set Config");
    console.log(parsed)
    universal.app_sounds = parsed.config.profiles[parsed.config.profile];
    universal.CLU("Incoming Data Handler:Setup", "Set Config Sounds");
    universal.plugins = parsed.plugins;
    universal.CLU("Incoming Data Handler:Setup", "Set plugins");
    universal._serverRequiresAuth = universal.config.useAuthentication;
    universal.CLU("Incoming Data Handler:Setup", "Set serverRequiresAuth");
    universal._init = true;
    universal.CLU("Incoming Data Handler:Setup", "_init: Completed.");

    // default setup
    universal.CLU("Incoming Data Handler", "Creating defaults.");

    universal.default("logs/notif", JSON.stringify([]));
    universal.default("playback-mode", "play_over");
    universal.default("vol-0", 1);
    universal.default("vol-1", 1);
    universal.default("pitch", 1);
    universal.default("uiSounds", true);
    universal.default("flags", JSON.stringify({}));
    universal.default("has_setup", "false");
    universal.default("theme", "default");
    universal.default("profile", "Default");
    universal.default("repos.community", JSON.stringify([]));
    universal.flags.reload();

    if (!universal.load("welcomed")) {
      universal.sendToast("Welcome to Freedeck.", "Freedeck");
      universal.CLU("Incoming Data Handler", "Welcomed user.");
      universal.save("welcomed", "true");
    }

    universal.CLU("Incoming Data Handler", "Saved TempLoginID.");
    universal.save("tempLoginID", parsed.tempLoginID);

    universal.keys.id = "keys";
    universal.CLU("Incoming Data Handler", "Forcefully setting keys ID.");
    if (!document.querySelector("#keys")) {
      universal.CLU("Incoming Data Handler", "Appending/Creating keys to body.");
      document.body.appendChild(universal.keys);
    }

    universal.notibar.id = "snackbar";
    universal.CLU("Incoming Data Handler", "Forcefully setting notibar ID.");
    if (!document.querySelector("#snackbar")) {
      universal.CLU(
        "Incoming Data Handler",
        "Appending/Creating notibar to body.",
      );
      document.body.appendChild(universal.notibar);
    }

    universal.CLU("Incoming Data Handler", "Setting up sidebar.");
    loadRightSidebar();

    universal.send(universal.events.information, { apiVersion: "2" });
    universal.CLU(
      "Incoming Data Handler",
      "Identified ourselves as Companion APIv2.",
    );

    if(universal.name === "Companion") {
      universal.repositoryManager.unofficial =
      universal.loadObj("repos.community", []) || [];
    universal.CLU("Incoming Data Handler", "Setup unofficial repositories.");
    }

    universal.CLU("Incoming Data Handler", "Setting up plugins for Tile Editor.");
    for (const plugin of Object.keys(universal.plugins)) {
      const plug = universal.plugins[plugin];
      for (const type of plug.types) {
        universal.CLU(
          "Incoming Data Handler",
          `Type: ${type.name} -> ${plug.name} (aka. ${plug.id})`,
        );
        universal._tyc.set(type, plug);
      }
    }

    if (user === "Companion") {
      handler();
      UI.reloadPluginViews();
      universal.CLU("Incoming Data Handler", "Native handler created.");
      const isNbwsClosed = universal._information.nbws;
      if(isNbwsClosed) {
        const iframe = document.createElement("iframe");
        iframe.src = "/companion/open_native.html";
        iframe.style.display = "none";
        document.body.appendChild(iframe);
      }
    }

    generic();
    universal.CLU(
      "Incoming Data Handler",
      "Generic native handler created. Resolving as we're finished here.",
    );
    universal.sendEvent("data_ready");
  });
  universal.CLU("Incoming Data Handler", "Sent Identify packet");
  universal.send(0x00, user);
}
