const express = require("express");
const fs = require("node:fs");
const path = require("node:path");
const router = express.Router();

// User data

const paths = {
  userData_themes: path.resolve("user-data/themes"),
  userData_soundpacks: path.resolve("user-data/soundpacks"),
  userData_sounds: path.resolve("user-data/sounds"),
  userData_icons: path.resolve("user-data/icons"),
  userData: path.resolve("user-data"),

  webui_client: path.resolve("webui/client"),
  webui_companion: path.resolve("webui/companion"),
  webui_common: path.resolve("webui/common"),

  webui_common_soundpacks: path.resolve("webui/common/sounds"),
  webui_common_themes: path.resolve("webui/shared/theming"),

  webui_app: path.resolve("webui/app"),
  webui_shared: path.resolve("webui/shared")
}

const expressRouters = {
  "/sounds": express.static(paths.userData_sounds),
  "/icons": express.static(paths.userData_icons),
  "/user-data": express.static(paths.userData),

  "/": express.static(paths.webui_client),
  "/companion": express.static(paths.webui_companion),
  "/common": express.static(paths.webui_common),
  "/app": express.static(paths.webui_app),
  "/app/shared": express.static(paths.webui_shared),
}

for(const routerName of Object.keys(expressRouters)) {
  const actualRouter = expressRouters[routerName];
  router.use(routerName, actualRouter);
}

router.get("/api/upload/report", (req, res) => {
  const start = Date.now();
  const report = [fs.readdirSync(paths.userData_sounds), fs.readdirSync(paths.userData_icons)];
  res.send({ report, time: Date.now() - start, start });
})

module.exports = {router, paths};
