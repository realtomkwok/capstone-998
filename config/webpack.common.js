'use strict';

const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const PATHS = require('./paths');

// used in the module rules and in the stats exlude list
const IMAGE_TYPES = /\.(png|jpe?g|gif|svg)$/i;

// To re-use webpack configuration across templates,
// CLI maintains a common webpack configuration file - `webpack.common.js`.
// Whenever user creates an extension, CLI adds `webpack.common.js` file
// in template's `config` folder
const common = {
	output: {
		// the build folder to output bundles and assets in.
		path: PATHS.build,
		// the filename template for entry chunks
		filename: '[name].bundle.js',
	},
	stats: {
		all: false,
		errors: true,
		builtAt: true,
		assets: true,
		excludeAssets: [IMAGE_TYPES],
	},
	module: {
		rules: [
			// Check for .ts and .tsx files and transpile them
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			// Check for .js files and transpile them
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env', '@babel/preset-react'],
					},
				},
			},
			// Help webpack in understanding CSS files imported in .js files
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader', 'postcss-loader'],
			},
			// Check for images imported in .js files and
			{
				test: IMAGE_TYPES,
				use: [
					{
						loader: 'file-loader',
						options: {
							outputPath: 'images',
							name: '[name].[ext]',
						},
					},
				],
			},
		],
	},
	plugins: [
		// Copy static assets from `public` folder to `build` folder
		new CopyWebpackPlugin({
			patterns: [
				{
					from: '**/*',
					context: 'public',
				},
			],
		}),
		// // Extract CSS into separate files
		// new MiniCssExtractPlugin({
		// 	filename: '[name].css',
		// }),
	],
};

module.exports = common;
