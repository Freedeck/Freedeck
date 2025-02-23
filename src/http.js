const express = require("express");
const http = require("node:http");

const picocolors = require("./utils/picocolors");

const app = express();
const server = http.createServer(app);
const config = require("@managers/settings");
const notifMan = require("@managers/notifications");
const { compileWebpack } = require("./webpack");

/** ROUTERS */
const handoffRouter = require("./routers/handoff");
const connectRouter = require("./routers/connect").router;
const staticRouter = require("./routers/static").router;
const uploadRouter = require("./routers/uploads");

const settings = config.settings();
const PORT = settings.port || 5754;

const networkAddresses = require("@managers/networkAddresses");

module.exports = {
  http,
  server,
  app,
};

compileWebpack().catch((err) => console.error(err));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use("/", staticRouter);

app.use("/connect", connectRouter);
app.use("/handoff", handoffRouter);

app.use("/fd/api/upload", uploadRouter);

app.get("/native/*", (req, res) => {
  fetch(`http://localhost:5756/${req.url.split("/").slice(2).join("/")}`)
    .then((res) => res.json())
    .then((a) => {
      res.send(a);
    })
    .catch((err) => {
      res.send({ _msg: "NativeBridge is not running.", error: err });
    });
});

app.get("/slider-value-change/:sTU/:sV", (req, res) => {
  notifMan.add("handoff-api", `nb-slider-${req.params.sTU}-${req.params.sV}`);
});

const netAddresses = networkAddresses();

server.listen(PORT, () => {
  for (const netInterface of Object.keys(netAddresses)) {
    const ipPort = `${netAddresses[netInterface][0]}:${PORT}`;
    console.log(
      picocolors.bgBlue(
        `Go to ${ipPort} on your mobile device (${netInterface})`,
      ),
    );
  }
});
