const path = require("node:path");

const cfg = {
  mode: "production",
  entry: {
    main: path.resolve("webui/companion/scripts/main.js"),
    settingsThemes: path.resolve("webui/companion/scripts/settingsThemes.js"),
    clientMain: path.resolve("webui/client/scripts/main.js"),
  },
  output: {
    path: path.resolve("webui/app"),
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
    settingsHelpers: "settingsHelpers",
  },
  stats: {
    errorDetails: true
  }
};

module.exports = cfg;
