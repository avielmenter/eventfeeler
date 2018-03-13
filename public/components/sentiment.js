import React from 'react';

import '../styles/sentiment.css';

export default class Sentiment extends React.Component {
	constructor(props, context) {
		super(props, context);
	}

	render() {
		var classes = "neutral glyphicon glyphicon-question-sign";
		if (this.props.neutral < 0.5)
			classes = this.props.pos > 0.5 ? "happy glyphicon glyphicon-plus-sign" : "sad glyphicon glyphicon-minus-sign";

		if (!this.props.pos || this.props.pos == 0)
			classes = "";

		return (
			<span className={classes}></span>
		);
	}
}