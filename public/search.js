import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import NavBar from './components/navbar.js'

var fields = document.getElementsByTagName('input');
for (let f of fields) {
	f.onkeydown = function(e) {
		if (e.keyCode == 13) // enter
			search();
	}
}

ReactDOM.render(<NavBar />, document.getElementsByTagName("nav")[0]);