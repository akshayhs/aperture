const mongoose = require('mongoose');
const moment = require('moment-timezone');
const Schema = mongoose.Schema;

const dateIndia = moment.tz(Date.now(), 'Asia/Calcutta');

const blogSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: dateIndia,
	},
	updatedAt: {
		type: Date,
	},
	author: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	comments: [
		{
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
	],
});

module.exports = mongoose.model('Blog', blogSchema);
