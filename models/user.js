const mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateIndia = moment.tz(Date.now(), 'Asia/Calcutta');

const Schema = mongoose.Schema;

const userSchema = new Schema(
	{
		username: {
			type: String,
			lowercase: true,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			lowercase: true,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		name: {
			first: { type: String },
			last: { type: String },
		},
		website: {
			type: String,
		},
		biography: {
			type: String,
		},
		cameras: {
			type: String,
		},
		lenses: {
			type: String,
		},
		images: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Image',
			},
		],
		blogs: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Blog',
			},
		],
	},
	{ timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
