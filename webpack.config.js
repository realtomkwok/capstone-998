const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
	entry: {
		content: './src/content.js',
		background: './src/background.js',
		popup: './src/popup.js',
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: '[name].bundle.js',
	},
	resolve: {
		extensions: ['.ts', '.js'],
		fallback: {
			'node:async_hooks': require.resolve('node:async_hooks'),
		},
	},
	plugins: [
		new NodePolyfillPlugin(),
	],
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env'],
					},
				},
			},
		],
	},
	mode: 'development',
};
