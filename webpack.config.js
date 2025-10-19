const path = require("node:path");

const cfg = {
	mode: "production",
	entry: {
		main: path.resolve("webui/companion/scripts/main.js"),
		universal: path.resolve("webui/shared/universal.js"),
		settingsThemes: path.resolve("webui/companion/scripts/settingsThemes.js"),
		clientMain: path.resolve("webui/client/scripts/main.js"),
	},
	output: {
		path: path.resolve("user-data/bundles"),
		filename: "[name].js",
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: "babel-loader",
				},
			},
		],
	},
	devtool: false,
	externals: {
		Pako: "Pako",
		'"compare-versions"': "compare-versions",
		settingsHelpers: "settingsHelpers",
	},
	stats: {
		errorDetails: true,
	},
};

module.exports = cfg;
