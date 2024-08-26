'use strict';

const { merge } = require('webpack-merge');
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');

const common = require('./webpack.common.js');
const PATHS = require('./paths');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');

// Merge webpack configuration files
const config = (env, argv) =>
	merge(common, {
		entry: {
			sidepanel: PATHS.src + '/index.tsx',
			background: PATHS.src + '/background.js',
		},
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
		plugins: [
			new Dotenv(),
			new webpack.ProvidePlugin({
				process: 'process/browser.js',
			}),

		],
		devtool: argv.mode === 'production' ? false : 'source-map',
	});

module.exports = config;
