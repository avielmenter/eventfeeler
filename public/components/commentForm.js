import React from 'react';
import axios from 'axios';

export default class CommentForm extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			comment_text:  null
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(event) {
		this.setState({
			comment_text: event.target.value
		});
	}

	handleSubmit(event) {
		event.preventDefault();
		var url = '/eventview.html?eventid=' + this.props.event_id;
		
		axios.post('/api/comment/', {
			text: this.state.comment_text,
			event_id: this.props.event_id
		})
		.then(r => {
			location.href = url;
		});
	}

	render() {
		return (	
			<div className="comment"><br />
				<form onSubmit={this.handleSubmit}>
					<label htmlFor='comment'>
						<textarea className="form-control" 
									rows="5" cols ="60" 
									id="comment" type="text" 
									placeholder="Comment on this event"
									onChange={this.handleChange}>
						</textarea>
					</label><br />
					<button className="btn btn-size">Submit</button>
				</form> 
			</div>
		);
	}
}