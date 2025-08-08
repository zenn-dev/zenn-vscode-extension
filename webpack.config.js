/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check
"use strict";

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

const path = require("path");

const { ESBuildMinifyPlugin } = require("esbuild-loader");
const webpack = require("webpack");

const ES_TARGET = "es2020";
const OUTPUT_PATH = path.join(__dirname, "./dist");
const IS_DEV = process.env.NODE_ENV !== "production";

/** @type WebpackConfig */
const webExtensionConfig = {
  mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
  target: "webworker", // extensions run in a webworker context
  entry: {
    extension: "./src/extension.ts",
    "test/suite/index": "./src/__test__/suite/index.ts",
  },
  output: {
    filename: "[name].js",
    path: path.join(OUTPUT_PATH, "./web"),
    libraryTarget: "commonjs",
    devtoolModuleFilenameTemplate: "../../[resource-path]",
  },
  resolve: {
    mainFields: ["browser", "module", "main"], // look for `browser` entry point in imported node modules
    extensions: [".ts", ".js"], // support ts-files and js-files
    alias: {
      // provides alternate implementation for node module and source files
    },
    fallback: {
      // Webpack 5 no longer polyfills Node.js core modules automatically.
      // see https://webpack.js.org/configuration/resolve/#resolvefallback
      // for the list of Node.js core module polyfills.
      assert: require.resolve("assert"),
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer/"),
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["css-loader"],
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "esbuild-loader",
            options: {
              loader: "ts",
              target: ES_TARGET,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({ 
      process: "process/browser.js",
      Buffer: ["buffer", "Buffer"],
    })
  ],
  externals: {
    vscode: "commonjs vscode", // ignored because it doesn't exist
  },
  performance: {
    hints: false,
  },
  devtool: "nosources-source-map", // create a source map that points to the original source file
  infrastructureLogging: {
    level: "log", // enables logging required for problem matchers
  },
};

/** @type WebpackConfig */
const webviewConfig = {
  target: "web",

  mode: IS_DEV ? "development" : "production",

  devtool: IS_DEV ? "inline-source-map" : void 0,

  entry: {
    zennContentsPreview: "./src/webviews/src/index.tsx",
  },

  output: {
    path: path.join(OUTPUT_PATH, "./webviews"),
    filename: "[name].js",
    clean: true,
  },

  optimization: !IS_DEV
    ? {
        minimize: true,
        minimizer: [
          new ESBuildMinifyPlugin({
            format: "cjs",
            minify: true,
            treeShaking: true,
            target: ES_TARGET,
            css: true,
          }),
        ],
      }
    : void 0,

  module: {
    rules: [
      {
        test: /\.svg$/,
        use: ["@svgr/webpack"],
      },
      {
        type: "asset/inline",
        test: /\.(png|jpg|jpeg|gif)$/i,
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "esbuild-loader",
          options: {
            loader: "tsx",
            target: ES_TARGET,
            tsconfigRaw: require("./src/webviews/tsconfig.json"),
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
    ],
  },

  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    fallback: {
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
    },
  },

  plugins: [new webpack.ProvidePlugin({ React: "react" })],
};

module.exports = [webExtensionConfig, webviewConfig];
