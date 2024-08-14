const path = require('path');

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
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	mode: 'development',
};
