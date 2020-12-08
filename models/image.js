const mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateIndia = moment.tz(Date.now(), 'Asia/Calcutta');

const Schema = mongoose.Schema;

const imageSchema = new Schema({
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	path: {
		type: String,
		required: true,
	},
	category: {
		type: String,
		required: true,
		enum: [ 'abstract', 'creative', 'landscape', 'monochrome', 'nature', 'open', 'pictorial', 'street', 'travel' ],
	},
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	tags: {
		type: Array,
	},
	camera: {
		type: String,
		required: true,
	},
	lens: {
		type: String,
		required: true,
	},
	exposure: {
		type: String,
		required: true,
	},
	shutterspeed: {
		type: String,
		required: true,
	},
	sensitivity: {
		type: String,
		required: true,
	},
	pptechniques: {
		type: String,
		minlength: 140,
		default: 'No information has been provided by the author.',
	},
	copyright: {
		type: Boolean,
		required: true,
	},
	createdAt: {
		type: Date,
		default: dateIndia,
	},
	updatedAt: {
		type: Date,
	},
});

module.exports = mongoose.model('Image', imageSchema);
