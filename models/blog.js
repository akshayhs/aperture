const mongoose = require('mongoose');
const moment = require('moment-timezone');
const Schema = mongoose.Schema;

const dateIndia = moment.tz(Date.now(), 'Asia/Calcutta');

const blogSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		abstract: {
			type: String,
			required: true,
			maxlength: 60,
		},
		description: {
			type: String,
			required: true,
			maxlength: 3000,
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
