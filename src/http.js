const express = require("express");

const { recordTime } = require("$/timer");
const debug = require('$/debug');

/** ROUTERS */
const handoffRouter = require("@routers/handoff");
const connectRouter = require("@routers/connect").router;
const staticRouter = require("@routers/static").router;
const uploadRouter = require("@routers/uploads");

recordTime("http:required-all-routers");
debug.log("All routers loaded!", "Server / HTTP")

const {http, server, app, deactivatePrerun} = require('@managers/http')

module.exports={http,server,app}

app.use(express.json());

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	next();
});

app.use("/", staticRouter);

app.use("/api", connectRouter);
deactivatePrerun();
app.use("/handoff", handoffRouter);

app.use("/api/upload", uploadRouter);

recordTime("http:loaded-all-endpoints");
debug.log("Endpoints created.", "Server / HTTP")