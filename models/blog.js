const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blogSchema = new Schema(
	{
		image: {
			type: String,
			required: true,
		},
		caption: {
			type: String,
			maxlength: 155,
			required: true,
		},
		title: {
			type: String,
			required: true,
		},
		alt_text: {
			type: String,
			maxlength: 120,
			default: this.title,
		},
		abstract: {
			type: String,
			required: true,
			maxlength: 60,
		},
		description: {
			type: String,
			required: true,
			maxlength: 1500,
		},
		copyright: {
			type: Boolean,
			required: true,
		},
		author: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		comments: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Comment',
			},
		],
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
