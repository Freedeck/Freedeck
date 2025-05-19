const express = require("express");
const http = require("node:http");

const picocolors = require("$/picocolors");

const app = express();
const server = http.createServer(app);
const config = require("@managers/settings");
const notifMan = require("@managers/notifications");
const { compileWebpack } = require("@src/webpack");

/** ROUTERS */
const handoffRouter = require("@routers/handoff");
const connectRouter = require("@routers/connect").router;
const staticRouter = require("@routers/static").router;
const uploadRouter = require("@routers/uploads");

const settings = config.settings();
const PORT = settings.port || 5754;

const networkAddresses = require("@managers/networkAddresses");
const netAddresses = networkAddresses();

module.exports = {
  http,
  server,
  app,
};

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use("/", staticRouter);

app.use("/api", connectRouter);
app.use("/handoff", handoffRouter);

app.use("/api/upload", uploadRouter);

app.get("/native/*path", (req, res) => {
  fetch(`http://localhost:5756/${req.url.split("/").slice(2).join("/")}`)
    .then((res) => res.json())
    .then((a) => {
      res.send(a);
    })
    .catch((err) => {
      res.send({ _msg: "NativeBridge is not running.", error: err });
    });
});

server.listen(PORT, () => {
  (async () => {
    compileWebpack().catch((err) => console.error(err));
  })()
  for (const netInterface of Object.keys(netAddresses)) {
    const ipPort = `${netAddresses[netInterface][0]}:${PORT}`;
    console.log(
      picocolors.bgBlue(
        `Go to ${ipPort} on your mobile device (${netInterface})`,
      ),
    );
  }
});
