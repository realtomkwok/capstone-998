'use strict';

const { merge } = require('webpack-merge');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');

const common = require('./webpack.common.js');
const PATHS = require('./paths');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

// Merge webpack configuration files
const config = (env, argv) =>
	merge(common, {
		entry: {
			sidepanel: PATHS.src + '/index.tsx',
			background: PATHS.src + '/background.js',
		},
		plugins: [
			new Dotenv(),
			new webpack.ProvidePlugin({
				process: 'process/browser.js',
			}),
		],
		resolve: {
			fallback: {
				'path': require.resolve('path-browserify'),
				'os': require.resolve('os-browserify/browser'),
				'crypto': require.resolve('crypto-browserify'),
				'buffer': require.resolve('buffer/'),
				'stream': require.resolve('stream-browserify'),
				'node:async_hooks': require.resolve('node:async_hooks'),
			},
			plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })],
			extensions: ['.tsx', '.ts', '.js'],
		},
		devServer: {
			header: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
				'Access-Control-Allow-Headers': 'Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, x-ijt, Referer, User-Agent',
			},
		},
		devtool: argv.mode === 'production' ? false : 'source-map',
	});

module.exports = config;
