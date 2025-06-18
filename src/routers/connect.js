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

const discoveryInformation = {
  title: "Freedeck",
  version,
};
const idList = [];
function recalculate() {
  idList.length = 0;
  const pl = plugins.plugins().keys();
  for (const key of pl) {
    idList.push(key);
  }
}
recalculate();

const ip = networkAddresses();
let firstIPKey = "";
let determinedIP = "";
if(Object.keys(ip).length > 0) {
  firstIPKey = Object.keys(ip)[0];
  determinedIP = ip[firstIPKey][0] || null;
}

let myAppCode = "Loading...";
const myAppUrlDisplay = "https://my.freedeck.app/";
const myAppUrl = "https://my.freedeck.app/api.php";

const randomlyGenerated = Math.random().toString(36).toUpperCase().split('.')[1].substring(0, 5);
const appCodeRequest = new URL(myAppUrl);
appCodeRequest.searchParams = new URLSearchParams();
appCodeRequest.searchParams.set("code", randomlyGenerated);
appCodeRequest.searchParams.set("name", "Companion");
appCodeRequest.searchParams.set("local_ip", determinedIP);

router.get("/discover/code-request", (req, res) => {
  if(myAppCode === "Loading..." || !myAppCode) {
    fetch(appCodeRequest).then((res) => res.text()).then((res) => {
      myAppCode = randomlyGenerated;
      if (res.includes('EXISTS@')) myAppCode = res.split('EXISTS@')[1].split('@')[0]
    }).catch((e => {
      console.error("Error fetching app code:", e);
      myAppCode = "Error";
    }));
  }
  res.send({
    code: myAppCode
  });
});


router.get("/discover", (req, res) => {
  if(plugins.plugins().keys().length !== idList.length) recalculate();
  Object.assign(discoveryInformation, {
    title: "Freedeck",
    version,
    plugins: idList,
    webpackStatus: iwebpackState,
    deviceStatus: tsm.get("isMobileConnected"),
    ip,
    myApp: {
      code: myAppCode,
      host: myAppUrlDisplay,
    }
  });
  res.send(discoveryInformation)
});


module.exports = {router, discoveryInformation, webpackState, getWs:()=>iwebpackState};
