'use strict';

const { merge } = require('webpack-merge');
const Dotenv= require('dotenv-webpack');
const webpack = require('webpack')

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      sidepanel: PATHS.src + '/sidepanel.js',
      background: PATHS.src + '/background.js',
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        }
      ],
    },
    resolve:{
		fallback: {
			"path": require.resolve('path-browserify'),
			"os": require.resolve('os-browserify/browser'),
			"crypto": require.resolve('crypto-browserify'),
			"buffer": require.resolve('buffer/'),
			"stream": require.resolve('stream-browserify'),
		},
      extensions: ['.tsx', '.ts', '.js'],
    },
	  plugins: [
		  new Dotenv(),
		  new webpack.ProvidePlugin({
			  process: 'process/browser.js',
		  }),
	  ],
    devtool: argv.mode === 'production' ? false : 'source-map',
  });

module.exports = config;
