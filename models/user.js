const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
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
