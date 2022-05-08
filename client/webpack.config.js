const path = require('path');
const webpack = require('webpack');

var config = {
	mode: 'production',
	target: ['web', 'es5'],
	entry: ['./src/index.ts', './src/display.ts', './src/auth.ts', './src/notes.ts'],
	output: {
		path: path.join(__dirname, '..', 'public', 'js'),
		filename: 'bundle.js',
	},
	resolve: {
		fallback: {"constants": false, "assert": false, "crypto": false, "buffer": false},
		extensions: ['.js', '.ts'],
		modules: [path.resolve(__dirname, 'src', 'lib'), path.resolve(__dirname, 'node_modules')]
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: [
					'babel-loader',
					'ts-loader'
				]
			}
		]
	},
};

exports.default = config;