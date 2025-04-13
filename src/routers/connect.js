const express = require("express");
const path = require("node:path");
const plugins = require("@managers/plugins");
const tsm = require("@managers/temporarySettings");
const networkAddresses = require("@managers/networkAddresses");
const router = express.Router();
const { version } = require(path.resolve("package.json"));

let iwebpackState = "uninitialized";

const webpackState = (i) => {
  iwebpackState = i;
}

const idList = [];
function recalculate() {
  idList.length = 0;
  const pl = plugins._plc.keys();
  for (const key of pl) {
    idList.push(key);
  }
}
recalculate();

const ip = networkAddresses();

router.get("/discover", (req, res) => {
  if(plugins._plc.keys().length !== idList.length) recalculate();
  res.send({
    title: "Freedeck",
    version,
    plugins: idList,
    webpackStatus: iwebpackState,
    deviceStatus: tsm.get("isMobileConnected"),
    ip
  })
});

module.exports = {router, webpackState, getWs:()=>iwebpackState};
