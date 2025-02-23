const { webpack } = require("webpack");
const fs = require("node:fs");
const path = require("node:path");
const picocolors = require("$/picocolors");
const { paths } = require("./routers/static");

const webpackConfigLocation = path.resolve("webpack.config.js");
const webpackBuildLocation = paths.webui_app;
const connectRouterLocation = path.resolve("src/routers/connect.js");

const webpackConfig = require(webpackConfigLocation);
const setWsStateHttp = require(connectRouterLocation).webpackState;

let compileTime = 0;
process.env.NODE_ENV = "production";

/**
 *  run webpack
 * @param {*} wp  a
 * @return {true}
 */
function runWebpack(webpackInstance) {
  if (!fs.existsSync(webpackBuildLocation)) {
    console.log(
      "Welcome to Freedeck! This is your first time running Freedeck, so it will take a moment to set up.",
    );
    fs.mkdirSync(webpackBuildLocation);
  }

  return new Promise((resolve, reject) => {
    webpackInstance.run((err, stats) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        compileTime = stats.endTime - stats.startTime;
        console.log(
          stats.toString({
            chunks: false,
            colors: true,
          }),
          picocolors.green(`\nCompiled webpack bundles in ${compileTime}ms`)
        );
        resolve();
      }
    });
  });
}

/**
 * Create the webpack compiler instance & use it asynchronously.
 * @return {Promise<void>}
 */
async function compileWebpack() {
  setWsStateHttp(0);
  const webpackInstance = webpack(webpackConfig);
  await runWebpack(webpackInstance).then(() => {
    setWsStateHttp(1);
  }).catch((e) => {
    console.error(e);
  });
}

module.exports = {
  compileWebpack,
  compileTime,
};
