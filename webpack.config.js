const path = require('path');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');

/**
 * Available environments
 * @type {Object.<string, string>}
 * @readonly
 */
const Env = {
  Prod: 'production',
  Dev: 'development',
  Test: 'test'
};

/**
 * Original the NODE_ENV value in lower case
 * @type {string}
 */
const environment = (process.env.NODE_ENV || Env.Dev).toLowerCase();
/**
 * Only two values may have: production or development
 * @type {string}
 */
const safeEnvironment = environment === Env.Prod ? Env.Prod : Env.Dev;
const development = [Env.Prod, Env.Test].indexOf(environment) === -1;
const production = environment === Env.Prod;
const test = environment === Env.Test;

module.exports = {
  mode: safeEnvironment,
  entry: [
    // application preparation module
    `./src/libs/bootstrap/index.ts`
  ],
  output: {
    path: path.join(__dirname, 'target'),
    filename: 'index.[contenthash].js',
    clean: true
  },
  devtool: production ? false : 'inline-source-map',
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/i,
        use: 'ts-loader'
      }
    ]
  },
  plugins: [
    new ESLintWebpackPlugin()
  ],
  optimization: {
    minimize: production,
    minimizer: [new TerserWebpackPlugin({
      extractComments: production,
      terserOptions: {
        /* @see https://github.com/terser/terser#minify-options */
        keep_classnames: development
      }
    })]
  }
};