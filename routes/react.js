var express = require('express');
var path = require('path');
var fs = require('fs');

module.exports = api => {
	var router = express.Router();

	router.get('/:jsFile', function(req, res, next) {
		var jsFile = req.params.jsFile;
		if (!jsFile || !jsFile.endsWith('.js')) {
			next();
			return;
		}

		var babelFile = path.join(__dirname, '../dist', jsFile.replace('.js', '.bundle.js'));

		try {
			fs.statSync(babelFile);
			res.sendFile(babelFile);
		} catch (err) {
			next();
		}
	});

	return router;
};