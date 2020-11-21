const mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateIndia = moment.tz(Date.now(), 'Asia/Calcutta');

const Schema = mongoose.Schema;

const userSchema = new Schema({
	username: {
		type: String,
		lowercase: true,
		required: true,
		unique: true,
	},
	createdAt: {
		type: Date,
		default: dateIndia,
	},
	updatedAt: { type: Date },
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
	aboutUser: {
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
});

module.exports = mongoose.model('User', userSchema);
