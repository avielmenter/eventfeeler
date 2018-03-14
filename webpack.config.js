var webpack = require('webpack');
var path = require('path');

module.exports = {
	entry: {
		map: './public/map.js',
		search: './public/search.js',
		recommendation: './public/recommendation.js',
		searchresults: './public/searchresults.js',
		eventview: './public/eventview.js'
	},
	output: {
		filename: '[name].bundle.js'
	},
	module: {
		rules: [
			{
				test: /public\/.*\.js|\\public\\.*\.js/,
				use: {
					loader: "babel-loader"
				}
			},
			{
				test: /\.css/,
				use: [{
						loader: "style-loader"
					}, {
						loader: "css-loader",
						options: {
							url: false
						}
					}
				]
			},
			{
				test: /\.less/,
				use: [{
						loader: "style-loader"
					}, {
						loader: "css-loader",
						options: {
							url: false
						}
					}, {
						loader: "less-loader",
						options: {
							relativeUrls: false
						}
					}
				]
			}
		]
	},
	plugins: [
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
	]
}