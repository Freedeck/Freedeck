const { webpack } = require("webpack");
const fs = require("node:fs");
const path = require("node:path");
const picocolors = require("$/picocolors");
const { paths } = require("./routers/static");
const dbg = require("$/debug");
const { recordTime } = require("$/timer");
const { setStartupMessage } = require("./managers/startupMessage");
const webpackConfigLocation = path.resolve("webpack.config.js");
const webpackBuildLocation = paths.userData_bundles;
const connectRouterLocation = path.resolve("src/routers/connect.js");

const webpackConfig = require(webpackConfigLocation);

let compileTime = -1;
let isCompilerFinished = true;
process.env.NODE_ENV = "production";

/**
 *  run webpack
 * @param {*} wp  a
 * @return {true}
 */
function runWebpack(webpackInstance) {
	recordTime("webpack:compile-begin");
	if (!fs.existsSync(webpackBuildLocation)) {
		console.log(
			"Welcome to Freedeck! This is your first time running Freedeck, so it will take a moment to set up.",
		);
		fs.mkdirSync(webpackBuildLocation);
	}

	compileTime = -1;
	isCompilerFinished = false;
	return new Promise((resolve, reject) => {
		webpackInstance.run((err, stats) => {
			isCompilerFinished = true;
			if (err) {
				console.log(err);
				reject(err);
			} else {
				compileTime = stats.endTime - stats.startTime;
				dbg.log(
					stats.toString({
						assets: false,
						cached: false,
						cachedAssets: false,
						children: false,
						chunks: false,
						chunkModules: false,
						chunkOrigins: false,
						colors: false,
						depth: false,
						entrypoints: false,
						errors: true,
						errorDetails: true,
						hash: false,
						maxModules: 0,
						modules: false,
						performance: false,
						providedExports: false,
						publicPath: false,
						reasons: false,
						source: false,
						timings: false,
						usedExports: false,
						version: false,
						warnings: true,
					}),
					"Webpack Compilation",
				);
				console.log(
					picocolors.green(`Compiled webpack bundles in ${compileTime}ms`),
				);
				recordTime("webpack:compile-complete");
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
	isCompilerFinished = false;
	setStartupMessage("Compiling Webpack Bundles..");
	const webpackInstance = webpack(webpackConfig);
	setStartupMessage("Building Freedeck..");
	await runWebpack(webpackInstance)
		.then(() => {
			setStartupMessage("Freedeck is ready!");
		})
		.catch((e) => {
			console.error(e);
		});
}

module.exports = {
	compileWebpack,
	compileTime,
	isCompilerFinished,
};
