const express = require("express");
const plugins = require("../managers/plugins");
const tsm = require("../managers/temporarySettings");
const networkAddresses = require("../managers/networkAddresses");
const router = express.Router();

let iwebpackState = 0;

const webpackState = (i) => {
  iwebpackState = i;
}

router.get("/plugins", (req, res) => {
  const idList = [];
  const pl = plugins._plc.keys();
  for (const key of pl) {
    idList.push(key);
  }
  res.send({ plugins: idList });
});

router.get("/status", (req, res) => res.sendStatus(200));

router.get("/webpack", (req, res) => {
  res.send({ compiled: iwebpackState });
});

router.get("/local-ip", (req, res) => {
  res.send({ ip: networkAddresses() });
});

router.get("/dev-status", (req, res) => {
  res.send({
    message: tsm.get("isMobileConnected")
      ? "Your device is connected to Freedeck!"
      : "Your device is not connected to Freedeck!",
    state: tsm.get("isMobileConnected"),
  });
});

module.exports = {router, webpackState, getWs:()=>iwebpackState};
