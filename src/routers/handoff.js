const express = require("express");
const path = require('node:path');
const notifMan = require("@managers/notifications");
const plugins = require("@managers/plugins");
const router = express.Router();

const handoffData = {
  genTime: Date.now(),
  token: `${Math.random().toString(36).substring(2, 15)}h${Math.random().toString(36).substring(2, 15)}`.toUpperCase(),
  hasAccessed: false,
};

router.get("/get-token", (req, res) => {
  if (handoffData.genTime + 60000 < Date.now()) {
    handoffData.token = `${Math.random().toString(36).substring(2, 15)}h${Math.random().toString(36).substring(2, 15)}`.toUpperCase();
    handoffData.genTime = Date.now();
    handoffData.hasAccessed = false;
  }
  if (!handoffData.hasAccessed) {
    // handoffData.hasAccessed = true;
    return res.send(handoffData.token);
  }
  res.send("0".repeat(handoffData.token.length));
});

router.use('/:token', (req, res, next) => {
  if (req.params.token !== handoffData.token)
    return res.send({ status: "error", message: "Invalid token" });
  next();
})

router.get("/:token/play-ui-sound/:sound", (req, res) => {
  interactorDataSendToClient('ui-sound', {
    sound: req.params.sound
  })
  res.send({ status: "success", message: `Requested sound ${req.params.sound} to be queued.` });
});

router.get("/:token/reload-plugins", (req, res) => {
  plugins.reload();
  interactorDataSendToServer('reload-plugins')
  res.send({ status: "success", message: "Reloaded plugins." });
});

router.get("/:token/notify/:data", (req, res) => {
  interactorDataSendToServer('notify', {
    sender: "Handoff",
    data: req.params.data
  })
  res.send({ status: "success", message: "Sent notification." });
});

router.get("/:token/notify/:data/:sender", (req, res) => {
  const {sender, data} = req.params;
  interactorDataSendToServer('notify', {sender, data});
  res.send({ status: "success", message: "Sent notification." });
});


router.get("/:token/slider-change/:uuid/:value", (req, res) => {
  const {uuid, value} = req.params;
  interactorDataSendToServer('slider', {
    uuid,
    value
  })
  res.send({ status: "pending-success", message: "Attempting to change slider." });
});

function interactorDataSendToServer(id, data={}) {
  notifMan.add('handoff-api', `hid.s ${id} |${JSON.stringify(data)}`)
}

function interactorDataSendToClient(id, data={}) {
  notifMan.add('handoff-api', `hid.c ${id} |${JSON.stringify(data)}`)
}


module.exports = router;
