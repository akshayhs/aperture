const mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateIndia = moment.tz(Date.now(), 'Asia/Calcutta');

const Schema = mongoose.Schema;

const imageSchema = new Schema(
	{
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		path: {
			type: String,
			required: true,
		},
		public_id: {
			type: String,
			required: true,
		},
		category: {
			type: String,
			required: true,
			enum: [
				'abstract',
				'creative',
				'landscape',
				'monochrome',
				'nature',
				'open',
				'pictorial',
				'street',
				'travel',
			],
			trim: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		caption: {
			type: String,
			required: true,
			maxlength: 140,
			trim: true,
		},
		description: {
			type: String,
			required: true,
		},
		tags: {
			type: Array,
			trim: true,
		},
		camera: {
			type: String,
			required: true,
			trim: true,
		},
		lens: {
			type: String,
			required: true,
			trim: true,
		},
		exposure: {
			type: String,
			required: true,
			trim: true,
		},
		shutterspeed: {
			type: String,
			required: true,
			trim: true,
		},
		sensitivity: {
			type: Number,
			required: true,
			trim: true,
		},
		pptechniques: {
			type: String,
			maxlength: 140,
			default: 'No information has been provided by the author.',
		},
		copyright: {
			type: Boolean,
			required: true,
		},
		critiques: [ { type: Schema.Types.ObjectId, ref: 'Comment' } ],
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Image', imageSchema);
